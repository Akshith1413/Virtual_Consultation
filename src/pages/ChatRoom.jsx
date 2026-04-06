import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Paperclip, Smile, Send, Phone, Video, MoreVertical, Image, Check, CheckCheck, Info, Lock } from 'lucide-react';
import '../styles/Communication.css';

const SUGGESTED_REPLIES = [
  '📋 Share my symptoms',
  '📅 Reschedule appointment',
  '💊 Ask about medication',
  '🧪 Request lab results',
  '❓ General question',
  '🙏 Thank you, Doctor',
];

const DUMMY_MESSAGES = [
  { id: 1, sender: 'doctor', text: 'Hello! Welcome to your virtual consultation. How can I help you today?', time: '10:00 AM', read: true },
  { id: 2, sender: 'user', text: 'Hi Doctor! I\'ve been having persistent headaches for the past week.', time: '10:02 AM', read: true },
  { id: 3, sender: 'doctor', text: 'I\'m sorry to hear that. Can you describe the nature of the headaches? For example:\n\n• Where exactly do you feel the pain?\n• Is it constant or does it come and go?\n• On a scale of 1-10, how severe is it?', time: '10:03 AM', read: true },
  { id: 4, sender: 'user', text: 'It\'s mostly on the right side, comes and goes, and I\'d say around a 6-7 in severity.', time: '10:05 AM', read: true },
  { id: 5, sender: 'doctor', text: 'Thank you for that information. Based on what you\'ve described, it could be tension-type headaches or migraines. I\'d recommend:\n\n1. **Stay hydrated** - Drink at least 8 glasses of water daily\n2. **Rest well** - Aim for 7-8 hours of sleep\n3. **Screen breaks** - Take a 5-min break every hour\n\nIf the headaches persist beyond a few more days, we should schedule an in-person visit for a thorough examination.', time: '10:07 AM', read: true },
  { id: 6, sender: 'user', text: 'That\'s very helpful, thank you! Should I take any OTC medication?', time: '10:08 AM', read: false },
];

export default function ChatRoom() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const doctorName = searchParams.get('doctor') || 'Dr. Sarah Mitchell';
  
  const [messages, setMessages] = useState(DUMMY_MESSAGES);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [approved] = useState(true); // Simulated approval
  const chatMessagesRef = useRef(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    if (chatMessagesRef.current) {
      chatMessagesRef.current.scrollTo({
        top: chatMessagesRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, []);

  useEffect(() => { scrollToBottom(); }, [messages, isTyping, scrollToBottom]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '44px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [input]);

  const simulateDoctorReply = () => {
    setIsTyping(true);
    setTimeout(() => {
      setIsTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now(),
        sender: 'doctor',
        text: 'Thank you for your message. I\'ll review this and get back to you shortly. In the meantime, please don\'t hesitate to share any additional symptoms or concerns.',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        read: true,
      }]);
    }, 2500);
  };

  const handleSend = (text = input) => {
    const trimmed = (text || '').trim();
    if (!trimmed) return;
    setMessages(prev => [...prev, {
      id: Date.now(),
      sender: 'user',
      text: trimmed,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      read: false,
    }]);
    setInput('');
    setShowSuggestions(false);
    simulateDoctorReply();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!approved) {
    return (
      <div className="comm-page" style={{ height: '100vh' }}>
        <div className="comm-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div className="chat-top-navbar">
            <button className="comm-back-btn" onClick={() => navigate(-1)} style={{ margin: 0 }}>
              <ArrowLeft size={16} /> Back
            </button>
          </div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="approval-gate">
            <div className="approval-gate-icon">🔒</div>
            <h2>Awaiting Doctor Approval</h2>
            <p>Your appointment needs to be confirmed by the doctor before you can start chatting. You'll be notified once approved.</p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate('/appointments')}
              style={{ padding: '14px 32px', borderRadius: '16px', border: 'none', background: 'linear-gradient(135deg, #4f46e5, #0ea5e9)', color: 'white', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif", boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)' }}
            >
              View Appointments
            </motion.button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="comm-page" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      
      {/* Proper Chat Navbar at the top */}
      <div className="chat-top-navbar" style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '16px 24px',
        background: 'rgba(15, 23, 42, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.08)',
        zIndex: 50,
        boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
        flexShrink: 0
      }}>
        <button className="comm-back-btn" onClick={() => navigate(-1)} style={{ margin: 0, padding: '10px 14px', border: 'none', background: 'transparent' }}>
          <ArrowLeft size={20} />
        </button>
        <div className="doctor-avatar" style={{ width: '44px', height: '44px', borderRadius: '14px' }}>👩‍⚕️</div>
        <div className="doctor-info" style={{ flex: 1 }}>
          <h3 style={{ fontSize: '18px', margin: 0 }}>{doctorName}</h3>
          <span>Online</span>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <motion.button whileHover={{ scale: 1.15, rotate: 5 }} whileTap={{ scale: 0.9 }} className="chat-action-btn" onClick={() => navigate(`/voice-call/demo?doctor=${encodeURIComponent(doctorName)}`)} title="Voice Call" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Phone size={20} color="#38bdf8" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.15, rotate: 5 }} whileTap={{ scale: 0.9 }} className="chat-action-btn" onClick={() => navigate(`/video-call/demo?doctor=${encodeURIComponent(doctorName)}`)} title="Video Call" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Video size={20} color="#a855f7" />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="chat-action-btn" title="Information" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <Info size={20} />
          </motion.button>
          <motion.button whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }} className="chat-action-btn" title="More" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)' }}>
            <MoreVertical size={20} />
          </motion.button>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0 }} 
        animate={{ opacity: 1 }} 
        transition={{ duration: 0.5 }}
        className="comm-content"
        style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}
      >
        <div className="chat-container" style={{ height: '100%', maxWidth: '1200px', margin: '0 auto', width: '100%', display: 'flex', flexDirection: 'column' }}>


          {/* Messages */}
          <div className="chat-messages" ref={chatMessagesRef}>
            <div className="chat-date-divider"><span>Today</span></div>
            <div style={{ textAlign: 'center', marginBottom: '20px', display: 'flex', justifyContent: 'center' }}>
              <div style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#fbbf24', padding: '8px 16px', borderRadius: '12px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(245, 158, 11, 0.2)', maxWidth: '80%' }}>
                <Lock size={14} />
                <span>Messages and calls are <strong>end-to-end encrypted</strong>. No one outside of this consultation can read or listen to them.</span>
              </div>
            </div>
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 24 }}
                  className={`chat-bubble-row ${msg.sender === 'user' ? 'sent' : ''}`}
                >
                  <div className="chat-bubble-avatar">
                    {msg.sender === 'doctor' ? '👩‍⚕️' : '👤'}
                  </div>
                  <div>
                    <div className="chat-bubble" dangerouslySetInnerHTML={{
                      __html: msg.text
                        .replace(/\*\*(.*?)\*\*/g, '<strong style="color:#fcd34d">$1</strong>')
                        .replace(/\n/g, '<br/>')
                    }} />
                    <div className="chat-bubble-meta">
                      <span>{msg.time}</span>
                      {msg.sender === 'user' && (
                        <span className="read-tick">
                          {msg.read ? <CheckCheck size={14} /> : <Check size={14} />}
                        </span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {/* Typing indicator */}
            <AnimatePresence>
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }} 
                  animate={{ opacity: 1, y: 0, scale: 1 }} 
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="chat-bubble-row"
                >
                  <div className="chat-bubble-avatar">👩‍⚕️</div>
                  <div className="chat-bubble" style={{ display: 'flex', gap: 6, padding: '16px 20px' }}>
                    {[0, 1, 2].map(i => (
                      <motion.span
                        key={i}
                        style={{ width: 8, height: 8, borderRadius: '50%', background: '#a78bfa' }}
                        animate={{ opacity: [0.3, 1, 0.3], y: [0, -4, 0] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-input-wrapper">
            {/* Suggested Replies */}
            <AnimatePresence>
              {showSuggestions && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="chat-suggestions"
                >
                  {SUGGESTED_REPLIES.map((reply, i) => (
                    <motion.button
                      key={i}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="chat-suggestion-chip"
                      onClick={() => handleSend(reply)}
                    >
                      {reply}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>

            {/* Input Bar */}
            <div className="chat-input-bar">
              <motion.button whileHover={{ scale: 1.15, rotate: -10 }} whileTap={{ scale: 0.9 }} className="chat-action-btn" title="Attach file">
                <Paperclip size={20} />
              </motion.button>
              <motion.button whileHover={{ scale: 1.15, rotate: 10 }} whileTap={{ scale: 0.9 }} className="chat-action-btn" title="Send image">
                <Image size={20} />
              </motion.button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your message..."
                rows={1}
              />
              <motion.button whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }} className="chat-action-btn" title="Emoji">
                <Smile size={20} />
              </motion.button>
              <button className="chat-send-btn" onClick={() => handleSend()} disabled={!input.trim()} title="Send">
                <Send size={18} style={{ marginLeft: 2 }} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
 
 
 
