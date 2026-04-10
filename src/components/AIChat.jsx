import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { sendChatMessage } from '../services/aiService';
import '../styles/AIChat.css';

const QUICK_ACTIONS = [
  { label: 'ðŸ” Check symptoms', prompt: 'I want to check my symptoms' },
  { label: 'ðŸ¥— Diet advice', prompt: 'Give me personalized diet advice' },
  { label: 'ðŸ˜´ Sleep tips', prompt: 'How can I improve my sleep?' },
  { label: 'ðŸ’Š Supplements', prompt: 'What supplements should I consider?' },
  { label: 'ðŸ§  Stress help', prompt: 'I need help managing stress' },
  { label: 'ðŸ‹ï¸ Exercise', prompt: 'Recommend an exercise routine for me' },
];

export default function AIChat() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, scrollToBottom]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = '42px';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 100) + 'px';
    }
  }, [input]);

  const formatResponse = (text) => {
    // Convert markdown-like formatting to JSX-safe HTML
    return text
      .split('\n')
      .map((line, i) => {
        // Bold
        line = line.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
        // Italic
        line = line.replace(/\*(.*?)\*/g, '<em>$1</em>');
        // Horizontal rule
        if (line.trim() === '---') return '<hr/>';
        // List items
        if (line.trim().startsWith('- ')) {
          return `<div style="padding-left:12px">â€¢ ${line.trim().slice(2)}</div>`;
        }
        if (/^\d+\.\s/.test(line.trim())) {
          return `<div style="padding-left:12px">${line.trim()}</div>`;
        }
        // Headers
        if (line.trim().startsWith('### ')) return `<div style="font-weight:600;color:#c7d2fe;margin-top:6px">${line.trim().slice(4)}</div>`;
        if (line.trim().startsWith('## ')) return `<div style="font-weight:600;color:#c7d2fe;margin-top:6px">${line.trim().slice(3)}</div>`;
        // Emoji headers (like "ðŸ¥— **Nutrition Tips:**")
        return line || '<br/>';
      })
      .join('\n');
  };

  const handleSend = async (text = input) => {
    const trimmed = (text || '').trim();
    if (!trimmed || loading) return;

    const userMsg = { role: 'user', content: trimmed, time: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await sendChatMessage(trimmed, sessionId);
      if (result.sessionId) setSessionId(result.sessionId);

      const aiMsg = {
        role: 'assistant',
        content: result.response || 'I\'m having trouble responding right now. Please try again.',
        time: new Date()
      };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'âš ï¸ Sorry, I\'m temporarily unavailable. Please try again in a moment.\n\n*If this persists, the AI service may be starting up.*',
        time: new Date()
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickAction = (prompt) => {
    handleSend(prompt);
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Hide AI chat bubble on communication pages
  const hiddenRoutes = ['/chat', '/video-call', '/voice-call'];
  const isHidden = hiddenRoutes.some(route => location.pathname.startsWith(route));

  if (isHidden) return null;

  return (
    <>
      {/* Floating Bubble */}
      <button
        className="ai-chat-bubble"
        onClick={() => setIsOpen(!isOpen)}
        title="AI Health Assistant"
        id="ai-chat-trigger"
      >
        {isOpen ? (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a8 8 0 0 0-8 8c0 2.5 1.2 4.7 3 6.2V20l3.5-2.1c.5.1 1 .1 1.5.1a8 8 0 0 0 0-16z" />
              <circle cx="9" cy="10" r="1" fill="currentColor" />
              <circle cx="12" cy="10" r="1" fill="currentColor" />
              <circle cx="15" cy="10" r="1" fill="currentColor" />
            </svg>
            <div className="ai-badge" />
          </>
        )}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="ai-chat-panel" id="ai-chat-panel">
          {/* Header */}
          <div className="ai-chat-header">
            <div className="ai-chat-header-left">
              <div className="ai-chat-avatar">ðŸ§ </div>
              <div className="ai-chat-header-info">
                <h3>AI Health Assistant</h3>
                <span>Online â€” Ready to help</span>
              </div>
            </div>
            <div className="ai-chat-header-actions">
              <button
                onClick={() => { setMessages([]); setSessionId(null); }}
                title="Clear chat"
              >
                ðŸ—‘ï¸
              </button>
              <button onClick={() => setIsOpen(false)} title="Close">âœ•</button>
            </div>
          </div>

          {/* Messages */}
          <div className="ai-chat-messages">
            {messages.length === 0 ? (
              <div className="ai-welcome">
                <div className="ai-welcome-icon">ðŸ§ </div>
                <h4>AI Health Assistant</h4>
                <p>Ask me anything about health, symptoms, nutrition, sleep, exercise, or mental wellness. I use your health profile for personalized advice.</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`ai-msg ${msg.role}`}>
                  <div className="ai-msg-avatar">
                    {msg.role === 'assistant' ? 'ðŸ§ ' : 'ðŸ‘¤'}
                  </div>
                  <div>
                    <div
                      className="ai-msg-content"
                      dangerouslySetInnerHTML={{ __html: formatResponse(msg.content) }}
                    />
                    <div className="ai-msg-time">{formatTime(msg.time)}</div>
                  </div>
                </div>
              ))
            )}

            {loading && (
              <div className="ai-msg assistant">
                <div className="ai-msg-avatar">ðŸ§ </div>
                <div className="ai-typing-dots">
                  <span /><span /><span />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Actions */}
          {messages.length === 0 && (
            <div className="ai-quick-actions">
              {QUICK_ACTIONS.map((action, i) => (
                <button
                  key={i}
                  className="ai-quick-chip"
                  onClick={() => handleQuickAction(action.prompt)}
                >
                  {action.label}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="ai-chat-input-area">
            <div className="ai-chat-input-wrapper">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about health, symptoms, diet..."
                rows={1}
                disabled={loading}
              />
              <button
                className="ai-send-btn"
                onClick={() => handleSend()}
                disabled={!input.trim() || loading}
                title="Send message"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" opacity="0.2" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
 
 
 
 
 
 
 

// minor tweak for clarity

// minor tweak for clarity
