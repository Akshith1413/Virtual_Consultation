import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Video, VideoOff, MessageSquare, Maximize2, Signal } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../styles/Communication.css';

export default function VideoCallRoom() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const doctorName = searchParams.get('doctor') || 'Dr. Sarah Mitchell';

  const [callState, setCallState] = useState('precall'); // precall, connecting, incall
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [timer, setTimer] = useState(0);

  // Timer logic
  useEffect(() => {
    let interval;
    if (callState === 'incall') {
      interval = setInterval(() => setTimer(t => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [callState]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const startCall = () => {
    setCallState('connecting');
    setTimeout(() => {
      setCallState('incall');
    }, 3000);
  };

  const endCall = () => {
    navigate(-1);
  };

  return (
    <div className="comm-page">
      {callState !== 'incall' && <Navbar />}
      
      <AnimatePresence mode="wait">
        {callState === 'precall' && (
          <motion.div 
            key="precall"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="precall-screen"
          >
            <div className="precall-card">
              <div style={{ width: 140, height: 140, margin: '0 auto 24px', borderRadius: '50%', background: '#1e293b', overflow: 'hidden', border: '2px solid rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
                {isVideoOff ? <VideoOff size={40} color="#64748b" /> : <div style={{ fontSize: 60 }}>👤</div>}
                {!isVideoOff && <div className="camera-scanner" />}
              </div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 8px', fontSize: 28, color: '#f8fafc' }}>Ready to join?</h2>
              <p style={{ margin: 0, color: '#94a3b8' }}>Video consultation with <strong style={{color: '#fff'}}>{doctorName}</strong></p>
              
              <div className="precall-toggles">
                <motion.button 
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className={`precall-toggle ${isMuted ? 'off' : ''}`}
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </motion.button>
                <motion.button 
                  whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                  className={`precall-toggle ${isVideoOff ? 'off' : ''}`}
                  onClick={() => setIsVideoOff(!isVideoOff)}
                >
                  {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </motion.button>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="precall-start-btn video-btn"
                onClick={startCall}
              >
                <Video size={20} /> Join Video Call
              </motion.button>
              <button 
                className="comm-back-btn" 
                onClick={() => navigate(-1)}
                style={{ width: '100%', justifyContent: 'center', marginTop: 16, background: 'transparent', border: '1px solid rgba(255,255,255,0.1)' }}
              >
                Cancel
              </button>
            </div>
          </motion.div>
        )}

        {callState === 'connecting' && (
          <motion.div 
            key="connecting"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="video-container"
          >
            <div className="video-main">
              <div className="video-glass-overlay">
                <div className="call-avatar-wrapper">
                  <div className="call-pulse-ring" />
                  <div className="call-pulse-ring" />
                  <div className="call-pulse-ring" />
                  <div className="call-avatar">👩‍⚕️</div>
                </div>
                <h2 className="call-doctor-name" style={{ marginTop: 40 }}>{doctorName}</h2>
                <div className="call-status" style={{ marginTop: 16 }}>Connecting...</div>
              </div>
            </div>
          </motion.div>
        )}

        {callState === 'incall' && (
          <motion.div 
            key="incall"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="video-container"
          >
            <div className="video-main">
              {/* Main Video (Doctor) */}
              <div style={{ fontSize: 160, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.5))' }}>👩‍⚕️</div>
            </div>

            <motion.div 
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="video-call-info"
            >
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444', animation: 'comm-pulse-dot 2s infinite' }} />
              <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: 600, fontSize: 18, color: '#fff', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timer)}</span>
              <span style={{ width: 1, height: 16, background: 'rgba(255,255,255,0.2)' }} />
              <span style={{ fontWeight: 500, color: '#e2e8f0' }}>{doctorName}</span>
            </motion.div>

            <motion.div 
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="video-quality"
            >
              <Signal size={14} /> HD
            </motion.div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ delay: 0.4, type: 'spring' }}
              className="video-self-preview"
            >
              {isVideoOff ? <VideoOff size={40} color="#64748b" /> : '👤'}
            </motion.div>

            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.5, type: 'spring' }}
              className="video-dock"
            >
              <div className="call-controls-dock">
                <button className={`call-ctrl-btn ${isMuted ? 'active' : ''}`} onClick={() => setIsMuted(!isMuted)}>
                  {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>
                <button className={`call-ctrl-btn ${isVideoOff ? 'active' : ''}`} onClick={() => setIsVideoOff(!isVideoOff)}>
                  {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
                <button className="call-ctrl-btn" onClick={() => navigate(`/chat/demo?doctor=${encodeURIComponent(doctorName)}`)}>
                  <MessageSquare size={24} />
                </button>
                <button className="call-ctrl-btn end-btn" onClick={endCall}>
                  <PhoneOff size={28} />
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
 
 
 
 
 
 
