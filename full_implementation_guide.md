# Full Implementation Guide: Video, Voice & Chat — Real-Time Communication

This guide covers how to upgrade the current UI-only communication features to fully functional real-time video calls, voice calls, and chat messaging.

---

## Table of Contents

1. [Architecture Overview](#1-architecture-overview)
2. [Prerequisites](#2-prerequisites)
3. [Backend Setup — Socket.io](#3-backend-setup--socketio)
4. [Real-Time Chat Implementation](#4-real-time-chat-implementation)
5. [WebRTC Video & Voice Calls](#5-webrtc-video--voice-calls)
6. [Alternative: Twilio / Agora](#6-alternative-twilio--agora)
7. [TURN/STUN Server Configuration](#7-turnstun-server-configuration)
8. [Database Schema Changes](#8-database-schema-changes)
9. [Security & HIPAA Considerations](#9-security--hipaa-considerations)
10. [Testing Checklist](#10-testing-checklist)

---

## 1. Architecture Overview

```
┌─────────────┐    WebSocket    ┌─────────────────┐    MongoDB
│  React App  │ ◄────────────► │  Node.js Backend │ ◄──────────►  DB
│  (Frontend) │    Socket.io   │  (Express + WS)  │
└──────┬──────┘                └────────┬─────────┘
       │                                │
       │         WebRTC P2P             │
       │ ◄────────────────────────────► │
       │    (Video/Audio streams)       │
       │                                │
       │         TURN/STUN              │
       └──────► (ICE Servers) ◄────────┘
```

## 2. Prerequisites

### Install Dependencies

**Backend** (`C:\VirtualConsultation_Back`):
```bash
npm install socket.io
npm install simple-peer   # WebRTC signaling helper (optional)
```

**Frontend** (`C:\virtualConsultation`):
```bash
npm install socket.io-client
npm install simple-peer    # WebRTC helper (optional)
```

---

## 3. Backend Setup — Socket.io

### 3.1 Modify `server.js` or `index.js`

```javascript
// At the top of your main backend file
const { createServer } = require('http');
const { Server } = require('socket.io');

// Replace your existing app.listen with:
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Authentication middleware for Socket.io
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication required'));
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.userId = decoded.userId || decoded.id;
    next();
  } catch (err) {
    next(new Error('Invalid token'));
  }
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.userId}`);
  
  // Join personal room for private messaging
  socket.join(`user:${socket.userId}`);

  // ── Chat Events ──
  socket.on('chat:send', async (data) => {
    // data = { to: recipientUserId, message: string, appointmentId: string }
    const msg = await ChatMessage.create({
      from: socket.userId,
      to: data.to,
      message: data.message,
      appointmentId: data.appointmentId,
      timestamp: new Date(),
    });
    // Emit to recipient
    io.to(`user:${data.to}`).emit('chat:receive', msg);
    // Confirm to sender
    socket.emit('chat:sent', msg);
  });

  socket.on('chat:typing', (data) => {
    io.to(`user:${data.to}`).emit('chat:typing', { from: socket.userId });
  });

  socket.on('chat:read', async (data) => {
    await ChatMessage.updateMany(
      { from: data.from, to: socket.userId, read: false },
      { read: true, readAt: new Date() }
    );
    io.to(`user:${data.from}`).emit('chat:read', { by: socket.userId });
  });

  // ── Call Signaling Events ──
  socket.on('call:initiate', (data) => {
    // data = { to, type: 'voice'|'video', appointmentId }
    io.to(`user:${data.to}`).emit('call:incoming', {
      from: socket.userId,
      type: data.type,
      appointmentId: data.appointmentId,
    });
  });

  socket.on('call:accept', (data) => {
    io.to(`user:${data.to}`).emit('call:accepted', { from: socket.userId });
  });

  socket.on('call:reject', (data) => {
    io.to(`user:${data.to}`).emit('call:rejected', { from: socket.userId });
  });

  socket.on('call:end', (data) => {
    io.to(`user:${data.to}`).emit('call:ended', { from: socket.userId });
  });

  // ── WebRTC Signaling ──
  socket.on('webrtc:offer', (data) => {
    io.to(`user:${data.to}`).emit('webrtc:offer', {
      from: socket.userId,
      offer: data.offer,
    });
  });

  socket.on('webrtc:answer', (data) => {
    io.to(`user:${data.to}`).emit('webrtc:answer', {
      from: socket.userId,
      answer: data.answer,
    });
  });

  socket.on('webrtc:ice-candidate', (data) => {
    io.to(`user:${data.to}`).emit('webrtc:ice-candidate', {
      from: socket.userId,
      candidate: data.candidate,
    });
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.userId}`);
  });
});

// Start server
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 4. Real-Time Chat Implementation

### 4.1 Create Socket Context (Frontend)

Create `src/context/SocketContext.jsx`:

```javascript
import { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    const newSocket = io(import.meta.env.VITE_API_BASE_URL?.replace('/api/', '') || 'http://localhost:3000', {
      auth: { token },
      transports: ['websocket', 'polling'],
    });

    newSocket.on('connect', () => console.log('Socket connected'));
    newSocket.on('connect_error', (err) => console.error('Socket error:', err));

    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
```

### 4.2 Update ChatRoom.jsx

Replace dummy messages with real-time socket events:

```javascript
// In ChatRoom.jsx, replace the simulated logic with:
import { useSocket } from '../context/SocketContext';

// Inside the component:
const socket = useSocket();

useEffect(() => {
  if (!socket) return;

  // Load chat history from API
  axios.get(`chat-messages/${appointmentId}`, { headers })
    .then(res => setMessages(res.data.messages));

  // Listen for incoming messages
  socket.on('chat:receive', (msg) => {
    setMessages(prev => [...prev, msg]);
  });

  socket.on('chat:typing', () => {
    setIsTyping(true);
    setTimeout(() => setIsTyping(false), 2000);
  });

  return () => {
    socket.off('chat:receive');
    socket.off('chat:typing');
  };
}, [socket, appointmentId]);

const handleSend = (text) => {
  if (!text.trim() || !socket) return;
  socket.emit('chat:send', {
    to: doctorUserId,
    message: text.trim(),
    appointmentId,
  });
};
```

---

## 5. WebRTC Video & Voice Calls

### 5.1 Create a WebRTC Hook

Create `src/hooks/useWebRTC.js`:

```javascript
import { useRef, useState, useEffect, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';

const ICE_SERVERS = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    // Add TURN server for production:
    // { urls: 'turn:your-turn-server.com:3478', username: 'user', credential: 'pass' },
  ],
};

export function useWebRTC(remoteUserId, callType = 'video') {
  const socket = useSocket();
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const [localStream, setLocalStream] = useState(null);
  const [remoteStream, setRemoteStream] = useState(null);
  const [callState, setCallState] = useState('idle'); // idle | calling | ringing | connected

  const getMedia = useCallback(async () => {
    const constraints = {
      audio: true,
      video: callType === 'video' ? { width: 1280, height: 720 } : false,
    };
    const stream = await navigator.mediaDevices.getUserMedia(constraints);
    localStreamRef.current = stream;
    setLocalStream(stream);
    return stream;
  }, [callType]);

  const createPeer = useCallback((stream, isInitiator) => {
    const peer = new RTCPeerConnection(ICE_SERVERS);

    stream.getTracks().forEach(track => peer.addTrack(track, stream));

    peer.ontrack = (event) => {
      setRemoteStream(event.streams[0]);
      setCallState('connected');
    };

    peer.onicecandidate = (event) => {
      if (event.candidate && socket) {
        socket.emit('webrtc:ice-candidate', {
          to: remoteUserId,
          candidate: event.candidate,
        });
      }
    };

    return peer;
  }, [socket, remoteUserId]);

  const initiateCall = useCallback(async () => {
    setCallState('calling');
    const stream = await getMedia();
    const peer = createPeer(stream, true);
    peerRef.current = peer;

    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);

    socket.emit('call:initiate', { to: remoteUserId, type: callType });
    socket.emit('webrtc:offer', { to: remoteUserId, offer });
  }, [socket, remoteUserId, callType, getMedia, createPeer]);

  const endCall = useCallback(() => {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    peerRef.current?.close();
    peerRef.current = null;
    setLocalStream(null);
    setRemoteStream(null);
    setCallState('idle');
    socket?.emit('call:end', { to: remoteUserId });
  }, [socket, remoteUserId]);

  const toggleMic = useCallback(() => {
    const audioTrack = localStreamRef.current?.getAudioTracks()[0];
    if (audioTrack) audioTrack.enabled = !audioTrack.enabled;
  }, []);

  const toggleCamera = useCallback(() => {
    const videoTrack = localStreamRef.current?.getVideoTracks()[0];
    if (videoTrack) videoTrack.enabled = !videoTrack.enabled;
  }, []);

  // Listen for incoming WebRTC events
  useEffect(() => {
    if (!socket) return;

    socket.on('webrtc:offer', async ({ from, offer }) => {
      setCallState('ringing');
      const stream = await getMedia();
      const peer = createPeer(stream, false);
      peerRef.current = peer;

      await peer.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await peer.createAnswer();
      await peer.setLocalDescription(answer);

      socket.emit('webrtc:answer', { to: from, answer });
    });

    socket.on('webrtc:answer', async ({ answer }) => {
      await peerRef.current?.setRemoteDescription(new RTCSessionDescription(answer));
    });

    socket.on('webrtc:ice-candidate', async ({ candidate }) => {
      await peerRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
    });

    socket.on('call:ended', () => endCall());

    return () => {
      socket.off('webrtc:offer');
      socket.off('webrtc:answer');
      socket.off('webrtc:ice-candidate');
      socket.off('call:ended');
    };
  }, [socket, getMedia, createPeer, endCall]);

  return {
    localStream, remoteStream, callState,
    initiateCall, endCall, toggleMic, toggleCamera,
  };
}
```

### 5.2 Update VideoCallRoom.jsx

Replace the simulated call with real WebRTC:

```javascript
import { useWebRTC } from '../hooks/useWebRTC';

// In component:
const { localStream, remoteStream, callState, initiateCall, endCall, toggleMic, toggleCamera } = useWebRTC(doctorUserId, 'video');

// Use <video> elements:
// <video ref={localVideoRef} autoPlay muted playsInline srcObject={localStream} />
// <video ref={remoteVideoRef} autoPlay playsInline srcObject={remoteStream} />
```

### 5.3 Update VoiceCallRoom.jsx

Same pattern but with `callType = 'audio'`.

---

## 6. Alternative: Twilio / Agora

If WebRTC peer-to-peer is too complex, use a managed service:

### Twilio Video

```bash
npm install twilio-video   # Frontend
npm install twilio          # Backend
```

Backend generates access tokens, frontend connects to Twilio rooms.

### Agora.io

```bash
npm install agora-rtc-sdk-ng  # Frontend
```

Agora provides free 10,000 minutes/month. Great for healthcare apps.

---

## 7. TURN/STUN Server Configuration

For production, you MUST have a TURN server (for NAT traversal):

### Free Option: Metered TURN
- Sign up at https://www.metered.ca/tools/openrelay/
- Get free TURN credentials

### Self-Hosted: Coturn
```bash
# Install coturn on your server
sudo apt install coturn

# Configure /etc/turnserver.conf
listening-port=3478
realm=your-domain.com
server-name=your-domain.com
lt-cred-mech
user=username:password
```

---

## 8. Database Schema Changes

### ChatMessage Model (Mongoose)

```javascript
const chatMessageSchema = new mongoose.Schema({
  from: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  to: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  message: { type: String, required: true },
  messageType: { type: String, enum: ['text', 'image', 'file'], default: 'text' },
  fileUrl: String,
  read: { type: Boolean, default: false },
  readAt: Date,
}, { timestamps: true });
```

### CallLog Model

```javascript
const callLogSchema = new mongoose.Schema({
  caller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  appointmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Appointment' },
  type: { type: String, enum: ['voice', 'video'], required: true },
  status: { type: String, enum: ['completed', 'missed', 'rejected'], default: 'completed' },
  startTime: Date,
  endTime: Date,
  duration: Number, // seconds
}, { timestamps: true });
```

### Backend API Endpoints Needed

```
GET    /api/chat-messages/:appointmentId   — Get chat history
POST   /api/chat-messages                  — Save a message (backup)
GET    /api/call-logs                      — Get call history
POST   /api/call-logs                      — Log a completed call
GET    /api/communication-history          — Unified history endpoint
```

---

## 9. Security & HIPAA Considerations

1. **End-to-End Encryption**: WebRTC uses SRTP (encrypted by default)
2. **Token Authentication**: All socket connections require valid JWT
3. **Data Storage**: Encrypt chat messages at rest in MongoDB
4. **Access Control**: Only the patient and assigned doctor can access a conversation
5. **Session Recording**: If recording calls, inform both parties and store securely
6. **Audit Logs**: Log all communication events for compliance
7. **Data Retention**: Implement automatic deletion policies

---

## 10. Testing Checklist

- [ ] Socket.io connects with valid JWT token
- [ ] Socket.io rejects connection without token
- [ ] Chat messages are sent and received in real-time
- [ ] Chat history persists across page reloads
- [ ] Typing indicator works bidirectionally
- [ ] Read receipts update correctly
- [ ] Video call: camera preview works on pre-call screen
- [ ] Video call: WebRTC connection established between 2 users
- [ ] Video call: audio/video toggles work during call
- [ ] Video call: end call terminates properly on both sides
- [ ] Voice call: audio-only connection works
- [ ] Voice call: waveform reflects actual audio levels
- [ ] Call logs are saved to database after each call
- [ ] Communication history shows real data from API
- [ ] Doctor approval gate blocks communication for unapproved appointments
- [ ] TURN server handles NAT traversal for remote users
- [ ] Works on Chrome, Firefox, Safari, Edge
- [ ] Mobile responsive and touch-friendly

---

## Quick Start Summary

1. `npm install socket.io` (backend) + `npm install socket.io-client` (frontend)
2. Add Socket.io server to your Express backend
3. Create `SocketContext.jsx` and wrap your app with `<SocketProvider>`
4. Replace dummy message logic in `ChatRoom.jsx` with socket events
5. Create `useWebRTC.js` hook for video/voice calls
6. Connect video/audio elements to WebRTC streams
7. Add MongoDB schemas for chat messages and call logs
8. Deploy a TURN server for production NAT traversal
9. Test thoroughly with 2 browser windows

**Estimated implementation time**: 2-3 days for chat, 3-5 days for video/voice calls.
 
 
 
 
 
 
 
