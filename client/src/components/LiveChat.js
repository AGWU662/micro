import React, { useState, useEffect } from 'react';
import './LiveChat.css';

const LiveChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      text: "Hello! Welcome to Elite-cloud Mining. How can I help you today?",
      sender: 'support',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isOnline, setIsOnline] = useState(true);

  // Auto-open chat after 5 seconds for first-time visitors
  useEffect(() => {
    const hasVisited = localStorage.getItem('chatVisited');
    if (!hasVisited) {
      const timer = setTimeout(() => {
        setIsOpen(true);
        localStorage.setItem('chatVisited', 'true');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const newMessage = {
      id: messages.length + 1,
      text: inputMessage,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages([...messages, newMessage]);
    setInputMessage('');

    // Auto-reply after 2 seconds (simulate support response)
    setTimeout(() => {
      const supportReplies = [
        "Thank you for your message. A support agent will assist you shortly.",
        "I understand your inquiry. Let me check our resources for you.",
        "Thanks for contacting Elite-cloud Mining support. How else can I help?",
        "I've noted your request. Is there anything specific about our mining services you'd like to know?",
        "Thank you for choosing Elite-cloud Mining. Our team will respond soon."
      ];
      
      const randomReply = supportReplies[Math.floor(Math.random() * supportReplies.length)];
      
      setMessages(prev => [...prev, {
        id: prev.length + 1,
        text: randomReply,
        sender: 'support',
        timestamp: new Date()
      }]);
    }, 2000);
  };

  const quickActions = [
    { text: "Account Issues", action: () => handleQuickMessage("I'm having issues with my account") },
    { text: "Mining Plans", action: () => handleQuickMessage("Tell me about your mining plans") },
    { text: "Withdrawals", action: () => handleQuickMessage("I need help with withdrawals") },
    { text: "P2P Trading", action: () => handleQuickMessage("How does P2P trading work?") },
    { text: "Crypto Loans", action: () => handleQuickMessage("I'm interested in crypto loans") }
  ];

  const handleQuickMessage = (message) => {
    setInputMessage(message);
  };

  const formatTime = (timestamp) => {
    return timestamp.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="live-chat-container">
      {/* Chat Toggle Button */}
      <div 
        className={`chat-toggle ${isOpen ? 'open' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <span className="close-icon">×</span>
        ) : (
          <>
            <span className="chat-icon">💬</span>
            <div className="chat-badge">
              <div className="pulse-ring"></div>
              <div className="pulse-dot"></div>
            </div>
          </>
        )}
      </div>

      {/* Chat Window */}
      {isOpen && (
        <div className="chat-window">
          {/* Chat Header */}
          <div className="chat-header">
            <div className="header-info">
              <div className="agent-avatar">👨‍💼</div>
              <div className="agent-details">
                <h4>Elite-cloud Support</h4>
                <span className={`status ${isOnline ? 'online' : 'offline'}`}>
                  {isOnline ? '🟢 Online' : '🔴 Offline'}
                </span>
              </div>
            </div>
            <button 
              className="minimize-btn"
              onClick={() => setIsOpen(false)}
            >
              ─
            </button>
          </div>

          {/* Chat Messages */}
          <div className="chat-messages">
            {messages.map((message) => (
              <div 
                key={message.id} 
                className={`message ${message.sender === 'user' ? 'user-message' : 'support-message'}`}
              >
                <div className="message-bubble">
                  <p>{message.text}</p>
                  <span className="message-time">{formatTime(message.timestamp)}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <p>Quick Actions:</p>
            <div className="action-buttons">
              {quickActions.map((action, index) => (
                <button 
                  key={index}
                  className="quick-action-btn"
                  onClick={action.action}
                >
                  {action.text}
                </button>
              ))}
            </div>
          </div>

          {/* Chat Input */}
          <form className="chat-input" onSubmit={handleSendMessage}>
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type your message..."
              className="message-input"
            />
            <button type="submit" className="send-btn">
              <span>📤</span>
            </button>
          </form>

          {/* Chat Footer */}
          <div className="chat-footer">
            <p>Powered by Elite-cloud Mining Support</p>
            <div className="support-links">
              <a href="mailto:support@coinscloud.net">📧 Email</a>
              <a href="tel:+1234567890">📞 Call</a>
              <a href="https://t.me/elitecloudmining">📱 Telegram</a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveChat;