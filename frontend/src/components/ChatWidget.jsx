import { useState, useEffect, useRef } from 'react';
import { FaComments, FaTimes, FaPaperPlane } from 'react-icons/fa';
import { getBotReply } from './chatBrain';

const ChatWidget = () => {
  const [isOpen, setIsOpen]     = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [message, setMessage]   = useState('');
  const [context, setContext]   = useState({
    lastLocation: null,
    lastTopic:    null,
    lastProduct:  null,
  });
  const [chatLog, setChatLog]   = useState([
    {
      role: 'bot',
      text: "Jambo! I'm the ShopZone Assistant. How can I help you today?",
      timestamp: new Date(),
    }
  ]);

  const scrollRef = useRef(null);

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

  const formatTime = (date) => {
    if (!date) return '';
    const now = new Date();
    const diff = Math.floor((now - new Date(date)) / 1000);
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

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
    <>
      <style>{`
        @keyframes float {
          0%   { transform: translateY(0px); }
          50%  { transform: translateY(-10px); }
          100% { transform: translateY(0px); }
        }
        @keyframes dotPulse {
          0%, 100% { opacity: 0.3; transform: scale(0.8); }
          50%       { opacity: 1;   transform: scale(1.2); }
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateX(10px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .typing-dot {
          width: 4px; height: 4px; margin: 0 1px;
          background-color: #D2B48C; border-radius: 50%;
          display: inline-block;
          animation: dotPulse 1s infinite ease-in-out;
        }
        .typing-dot:nth-child(2) { animation-delay: 0.2s; }
        .typing-dot:nth-child(3) { animation-delay: 0.4s; }
        .bot-dot { background-color: white; width: 6px; height: 6px; }
        .floating-container { animation: float 3s ease-in-out infinite; }
        .chat-window { animation: slideUp 0.3s ease-out; }
        .chat-message { animation: fadeIn 0.3s ease-out; }
        .quick-reply-btn:hover { background-color: #fdfaf5 !important; border-color: #B8956A !important; }
        .chat-input:focus { border-color: #D2B48C !important; outline: none; box-shadow: 0 0 0 2px rgba(210,180,140,0.2); }
      `}</style>

      <div style={{
        position: 'fixed',
        bottom:   'clamp(16px, 3vh, 30px)',
        right:    'clamp(12px, 3vw, 30px)',
        zIndex:   9999,
      }}>

        {/* ── Closed State — Floating Button ── */}
        {!isOpen ? (
          <div
            className='floating-container'
            style={{ display: 'flex', alignItems: 'center', gap: '15px' }}
          >
            <div style={{
              backgroundColor: 'white',
              color:           '#002147',
              padding:         '10px 18px',
              borderRadius:    '20px 20px 5px 20px',
              fontSize:        '14px',
              fontWeight:      '600',
              boxShadow:       '0 4px 15px rgba(0,0,0,0.1)',
              border:          '1px solid #D2B48C',
              animation:       'fadeIn 0.8s ease-out',
              whiteSpace:      'nowrap',
            }}>
              Questions? Ask me! 👋
            </div>
            <button
              aria-label='Open ShopZone chat assistant'
              onClick={() => setIsOpen(true)}
              style={{
                backgroundColor: '#002147',
                color:           '#D2B48C',
                borderRadius:    '50%',
                width:           '65px',
                height:          '65px',
                border:          '2px solid #D2B48C',
                cursor:          'pointer',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                boxShadow:       '0 6px 20px rgba(0,0,0,0.3)',
                flexShrink:      0,
              }}
            >
              <FaComments size={28} />
            </button>
          </div>
        ) : (

          /* ── Open State — Chat Window ── */
          <div
            className='chat-window'
            style={{
              position:        'absolute',
              bottom:          '75px',
              right:           0,
              width:           'min(350px, calc(100vw - 24px))',
              height:          'min(520px, 70vh)',
              backgroundColor: 'white',
              borderRadius:    '16px',
              display:         'flex',
              flexDirection:   'column',
              boxShadow:       '0 10px 40px rgba(0,33,71,0.2)',
              border:          '1px solid rgba(0,33,71,0.1)',
              overflow:        'hidden',
            }}
          >

            {/* Header */}
            <div style={{
              backgroundColor: '#002147',
              color:           '#D2B48C',
              padding:         '15px',
              display:         'flex',
              justifyContent:  'space-between',
              alignItems:      'center',
              flexShrink:      0,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width:           '38px',
                  height:          '38px',
                  backgroundColor: '#D2B48C',
                  borderRadius:    '50%',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  fontSize:        '18px',
                  flexShrink:      0,
                }}>
                  🛍️
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', fontSize: '14px' }}>
                    ShopZone Assistant
                  </div>
                  <div style={{
                    display:    'flex',
                    alignItems: 'center',
                    gap:        '5px',
                    fontSize:   '11px',
                    color:      'rgba(210,180,140,0.8)',
                  }}>
                    <div style={{
                      width:           '6px',
                      height:          '6px',
                      backgroundColor: '#4CAF50',
                      borderRadius:    '50%',
                    }} />
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
                type='button'
                aria-label='Close chat'
                onClick={() => setIsOpen(false)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#D2B48C',
                  cursor: 'pointer',
                  opacity: 0.7,
                  flexShrink: 0,
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <FaTimes />
              </button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              style={{
                flex:            1,
                padding:         '15px',
                overflowY:       'auto',
                backgroundColor: '#FAFAF9',
                display:         'flex',
                flexDirection:   'column',
                gap:             '10px',
              }}
            >
              {chatLog.map((msg, i) => (
                <div
                  key={i}
                  className='chat-message'
                  style={{
                    alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth:  '85%',
                  }}
                >
                  <div style={{
                    backgroundColor: msg.role === 'user' ? '#002147' : 'white',
                    color:           msg.role === 'user' ? '#D2B48C' : '#333',
                    padding:         '10px 14px',
                    borderRadius:    msg.role === 'user'
                      ? '15px 15px 2px 15px'
                      : '15px 15px 15px 2px',
                    fontSize:   '13.5px',
                    boxShadow:  '0 2px 5px rgba(0,0,0,0.05)',
                    border:     msg.role === 'bot' ? '1px solid #EAE0D5' : 'none',
                    whiteSpace: 'pre-line',
                    lineHeight: '1.5',
                  }}>
                    {msg.text}
                  </div>
                  <div style={{
                    fontSize:     '10px',
                    color:        '#999',
                    marginTop:    '3px',
                    textAlign:    msg.role === 'user' ? 'right' : 'left',
                    paddingLeft:  msg.role === 'bot' ? '4px' : 0,
                    paddingRight: msg.role === 'user' ? '4px' : 0,
                  }}>
                    {formatTime(msg.timestamp)}
                  </div>
                </div>
              ))}

              {/* Typing indicator */}
              {isTyping && (
                <div style={{ alignSelf: 'flex-start' }}>
                  <div style={{
                    backgroundColor: '#002147',
                    padding:         '10px 14px',
                    borderRadius:    '15px 15px 15px 2px',
                    display:         'inline-flex',
                    alignItems:      'center',
                  }}>
                    <span className='typing-dot bot-dot' />
                    <span className='typing-dot bot-dot' />
                    <span className='typing-dot bot-dot' />
                  </div>
                </div>
              )}

              {/* Quick replies */}
              {chatLog.length === 1 && !isTyping && (
                <div style={{
                  display:   'flex',
                  flexWrap:  'wrap',
                  gap:       '8px',
                  marginTop: '5px',
                }}>
                  {quickReplies.map((q, i) => (
                    <button
                      key={i}
                      className='quick-reply-btn'
                      onClick={() => handleSend(q)}
                      style={{
                        backgroundColor: 'white',
                        border:          '1px solid #D2B48C',
                        borderRadius:    '18px',
                        padding:         '6px 12px',
                        fontSize:        '12px',
                        color:           '#002147',
                        cursor:          'pointer',
                        transition:      'all 0.2s ease',
                        fontWeight:      '500',
                      }}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div style={{
              padding:         '12px',
              borderTop:       '1px solid #EAE0D5',
              display:         'flex',
              gap:             '10px',
              alignItems:      'center',
              backgroundColor: 'white',
              flexShrink:      0,
            }}>
              <input
                type='text'
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleSend()}
                placeholder='Ask something...'
                className='chat-input'
                style={{
                  flex:         1,
                  border:       '1px solid #EAE0D5',
                  borderRadius: '20px',
                  padding:      '10px 15px',
                  fontSize:     '14px',
                  outline:      'none',
                  transition:   'border-color 0.2s ease',
                  fontFamily:   'inherit',
                }}
              />
              <button
                aria-label='Send message'
                onClick={() => handleSend()}
                disabled={!message.trim() || isTyping}
                style={{
                  backgroundColor: message.trim() && !isTyping ? '#002147' : '#CCCCCC',
                  color:           message.trim() && !isTyping ? '#D2B48C' : '#888',
                  border:          'none',
                  borderRadius:    '50%',
                  width:           '40px',
                  height:          '40px',
                  cursor:          message.trim() && !isTyping ? 'pointer' : 'default',
                  display:         'flex',
                  alignItems:      'center',
                  justifyContent:  'center',
                  flexShrink:      0,
                  transition:      'all 0.2s ease',
                }}
              >
                <FaPaperPlane size={14} />
              </button>
            </div>
            <div style={{
              textAlign:       'center',
              padding:         '4px',
              fontSize:        '10px',
              color:           '#BBBBBB',
              backgroundColor: 'white',
              borderTop:       '1px solid #F5F0EB',
            }}>
              Powered by ShopZone
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ChatWidget;
