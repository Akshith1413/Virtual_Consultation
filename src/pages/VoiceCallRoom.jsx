import { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { PhoneOff, Mic, MicOff, Volume2, VolumeX, MessageSquare } from 'lucide-react';
import Navbar from '../components/Navbar';
import '../styles/Communication.css';

export default function VoiceCallRoom() {
  const navigate = useNavigate();
  const { appointmentId } = useParams();
  const [searchParams] = useSearchParams();
  const doctorName = searchParams.get('doctor') || 'Dr. Sarah Mitchell';

  const [callState, setCallState] = useState('precall'); // precall, ringing, incall
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(true);
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
    setCallState('ringing');
    setTimeout(() => {
      setCallState('incall');
    }, 3500);
  };

  const endCall = () => {
    navigate(-1);
  };

  return (
    <div className="comm-page">
      <Navbar />
      
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
            <div className="precall-card" style={{ background: 'rgba(15, 23, 42, 0.4)' }}>
              <div className="call-avatar-wrapper" style={{ margin: '0 auto 32px' }}>
                <div className="call-avatar">👩‍⚕️</div>
              </div>
              <h2 style={{ fontFamily: "'Outfit', sans-serif", margin: '0 0 8px', fontSize: 28, color: '#f8fafc' }}>Audio Call</h2>
              <p style={{ margin: 0, color: '#94a3b8' }}>Consultation with <strong style={{color: '#fff'}}>{doctorName}</strong></p>
              
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
                  className={`precall-toggle ${!isSpeaker ? 'off' : ''}`}
                  onClick={() => setIsSpeaker(!isSpeaker)}
                >
                  {!isSpeaker ? <VolumeX size={24} /> : <Volume2 size={24} />}
                </motion.button>
              </div>

              <motion.button 
                whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                className="precall-start-btn voice-btn"
                onClick={startCall}
              >
                <PhoneOff size={20} style={{ transform: 'rotate(135deg)' }} /> Start Audio Call
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

        {(callState === 'ringing' || callState === 'incall') && (
          <motion.div 
            key="active-call"
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ type: 'spring', damping: 20 }}
            className="call-screen"
          >
            <div className="call-avatar-wrapper" style={{ marginTop: '-10vh' }}>
              <div className="call-pulse-ring" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }} />
              <div className="call-pulse-ring" style={{ borderColor: 'rgba(16, 185, 129, 0.4)' }} />
              <div className="call-avatar" style={{ background: 'linear-gradient(135deg, #059669, #10b981)', border: 'none' }}>👩‍⚕️</div>
            </div>
            
            <div style={{ marginTop: 24 }}>
              <h2 className="call-doctor-name">{doctorName}</h2>
              {callState === 'ringing' ? (
                <div className="call-status" style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#34d399', borderColor: 'rgba(16, 185, 129, 0.2)', marginTop: 16 }}>Ringing...</div>
              ) : (
                <>
                  <p className="call-doctor-specialty">In progress</p>
                  <div className="voice-visualizer-container">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                      <div 
                        key={i} 
                        className="voice-wave-circle" 
                        style={{ 
                          width: `${100 + i * 20}px`, 
                          height: `${100 + i * 20}px`,
                          animationDelay: `${i * 0.2}s`,
                          borderColor: `rgba(16, 185, 129, ${0.4 - i * 0.05})`,
                          background: 'transparent'
                        }} 
                      />
                    ))}
                    <div className="call-timer" style={{ position: 'relative', zIndex: 10, fontSize: 48, background: 'linear-gradient(180deg, #fff, #34d399)', WebkitBackgroundClip: 'text' }}>
                      {formatTime(timer)}
                    </div>
                  </div>
                </>
              )}
            </div>

            <motion.div 
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3, type: 'spring' }}
              className="call-controls-dock"
              style={{ position: 'absolute', bottom: 40 }}
            >
              <button className={`call-ctrl-btn ${isMuted ? 'active' : ''}`} onClick={() => setIsMuted(!isMuted)}>
                {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
              </button>
              <button className={`call-ctrl-btn ${!isSpeaker ? 'active' : ''}`} onClick={() => setIsSpeaker(!isSpeaker)}>
                {!isSpeaker ? <VolumeX size={24} /> : <Volume2 size={24} />}
              </button>
              <button className="call-ctrl-btn" onClick={() => navigate(`/chat/demo?doctor=${encodeURIComponent(doctorName)}`)}>
                <MessageSquare size={24} />
              </button>
              <button className="call-ctrl-btn end-btn" onClick={endCall}>
                <PhoneOff size={28} />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
 
 
 
 
 
