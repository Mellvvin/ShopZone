import { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { getBotReply } from './chatBrain';
import './ChatWidget.css';

const ChatWidget = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage] = useState('');
  const [context, setContext] = useState({
    lastLocation: null,
    lastTopic: null,
    lastProduct: null,
  });
  const [chatLog, setChatLog] = useState([
    {
      role: 'bot',
      text: "Jambo! I'm the ShopZone Assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);

  const scrollRef = useRef(null);

  // ── Auto scroll to latest message ─────────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatLog, isTyping]);

  const quickReplies = [
    'How do I place an order?',
    'What payment methods do you accept?',
    'How do I become a seller?',
    'What is your return policy?',
  ];

  // ── Format timestamp for each message ─────────────────────────────────────
  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // ── Send message — calls chatBrain and waits for simulated typing delay ────
  const handleSend = (overrideInput = null) => {
    const textToSend = overrideInput || message;
    if (!textToSend.trim() || isTyping) return;

    setChatLog(prev => [...prev, {
      role: 'user',
      text: textToSend,
      timestamp: new Date(),
    }]);
    setMessage('');
    setIsTyping(true);

    const { reply, context: updatedContext } = getBotReply(textToSend, context);
    setContext(updatedContext);

    // Delay scales with reply length — feels like real typing
    const delay = Math.min(Math.max(reply.length * 12, 1000), 3000);

    setTimeout(() => {
      setIsTyping(false);
      setChatLog(prev => [...prev, {
        role: 'bot',
        text: reply,
        timestamp: new Date(),
      }]);
    }, delay);
  };

  return (
    <div className='cw-wrapper'>

      {/* ── Closed state — floating bubble + open button ── */}
      {!isOpen ? (
        <div className='cw-float-row'>
          <div className='cw-bubble'>
            Questions? Ask me! 👋
          </div>
          <button
            className='cw-open-btn'
            aria-label='Open ShopZone chat assistant'
            onClick={() => setIsOpen(true)}
          >
            <FaComments size={28} />
          </button>
        </div>

      ) : (

        /* ── Open state — full chat window ── */
        <div className='cw-window'>

          {/* Header */}
          <div className='cw-header'>
            <div className='cw-header-left'>
              <div className='cw-avatar'>🛍️</div>
              <div>
                <div className='cw-title'>ShopZone Assistant</div>
                <div className='cw-status'>
                  <div className='cw-status-dot' />
                  {isTyping ? (
                    <span>
                      Typing{' '}
                      <span className='typing-dot' />
                      <span className='typing-dot' />
                      <span className='typing-dot' />
                    </span>
                  ) : 'Online'}
                </div>
              </div>
            </div>
            <button
              className='cw-close-btn'
              aria-label='Close chat'
              onClick={() => setIsOpen(false)}
            >
              <FaTimes />
            </button>
          </div>

          {/* Messages */}
          <div className='cw-messages' ref={scrollRef}>
            {chatLog.map((msg, i) => (
              <div
                key={i}
                className={msg.role === 'user' ? 'cw-msg-row-user' : 'cw-msg-row-bot'}
              >
                <div className={msg.role === 'user' ? 'cw-msg-bubble-user' : 'cw-msg-bubble-bot'}>
                  {msg.text}
                </div>
                <div className={msg.role === 'user' ? 'cw-msg-time-user' : 'cw-msg-time-bot'}>
                  {formatTime(msg.timestamp)}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className='cw-msg-row-bot'>
                <div className='cw-typing-bubble'>
                  <span className='typing-dot bot-dot' />
                  <span className='typing-dot bot-dot' />
                  <span className='typing-dot bot-dot' />
                </div>
              </div>
            )}

            {/* Quick replies — only on first message */}
            {chatLog.length === 1 && !isTyping && (
              <div className='cw-quick-replies'>
                {quickReplies.map((q, i) => (
                  <button
                    key={i}
                    className='cw-quick-btn'
                    onClick={() => handleSend(q)}
                  >
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Input area */}
          <div className='cw-input-area'>
            <input
              type='text'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder='Ask something...'
              className='cw-input'
            />
            <button
              aria-label='Send message'
              onClick={() => handleSend()}
              disabled={!message.trim() || isTyping}
              className={`cw-send-btn ${message.trim() && !isTyping ? 'active' : 'inactive'}`}
            >
              <FaPaperPlane size={14} />
            </button>
          </div>

          {/* Powered by */}
          <div className='cw-powered'>
            Powered by ShopZone
          </div>

        </div>
      )}
    </div>
  );
};

export default ChatWidget;