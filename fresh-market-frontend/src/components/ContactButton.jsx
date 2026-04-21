import React, { useState, useEffect, useRef } from "react";
import { CloseOutlined, SendOutlined, LoadingOutlined } from "@ant-design/icons";
import { chatWithBot } from "../api/chatbot";
import { Link } from "react-router-dom";

const ContactButton = () => {
  const [isOpen, setIsOpen] = useState(false);
  const chatRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [messages, setMessages] = useState([
    {
      role: "model",
      text: "Xin chào! Bich Thuy Market có thể giúp gì cho bạn hôm nay?",
      products: [],
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleClick = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = (e) => {
    e.stopPropagation();
    setIsOpen(false);
  };

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  // Close the chatbox when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (chatRef.current && !chatRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userText = inputValue;
    const newMessages = [...messages, { role: "user", text: userText }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);

    try {
      const history = newMessages.slice(1, -1).map((msg) => ({
        role: msg.role === "model" ? "model" : "user",
        text: msg.text,
      }));

      const response = await chatWithBot({ message: userText, history });
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: response.reply,
          products: response.products || [],
        },
      ]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: "model",
          text: "Xin lỗi, đã xảy ra lỗi kết nối. Vui lòng thử lại sau.",
          products: [],
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div ref={chatRef}>
      {/* Floating Button Wrapper */}
      <div 
        className={`contact-button-wrapper ${isOpen ? "open" : ""}`} 
        onClick={handleClick}
      >
        <div className="pulse-ring"></div>
        <div className="contact-button">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M20 2H4C2.9 2 2 2.9 2 4V22L6 18H20C21.1 18 22 17.1 22 16V4C22 2.9 21.1 2 20 2Z"
              fill="white"
            />
            <circle cx="8" cy="11" r="1.2" fill="#1a5fa8" />
            <circle cx="12" cy="11" r="1.2" fill="#1a5fa8" />
            <circle cx="16" cy="11" r="1.2" fill="#1a5fa8" />
          </svg>
          <span className="contact-text">Liên hệ</span>
        </div>
      </div>

      {/* Chatbox Modal Overlay */}
      <div className={`chatbox-modal ${isOpen ? "active" : ""}`}>
        <button className="chatbox-close-top-center" onClick={handleClose}>
          <CloseOutlined />
        </button>
        <div className="chatbox-header">
          <div className="chatbox-header-content">
            <div className="header-avatar">
              <img
                src="/images/logo.png"
                alt="Bot Logo"
                onError={(e) => {
                  e.target.style.display = "none";
                }}
              />
              <div className="avatar-fallback">BT</div>
            </div>
            <div className="chatbox-header-info">
              <h4>Hệ Thống Chăm Sóc Khách Hàng</h4>
              <p>Chúng tôi luôn sẵn sàng giúp đỡ bạn</p>
            </div>
          </div>
        </div>

        <div className="chatbox-body">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`chat-message ${msg.role === "model" ? "bot" : "user"}`}
            >
              <div className="message-content-wrapper">
                <div className="message-text-row">
                  {msg.role === "model" && (
                    <div className="avatar">
                      <img
                        src="/images/logo.png"
                        alt="Bot Logo"
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                      <div className="avatar-fallback">BT</div>
                    </div>
                  )}
                  <div className="message-content">{msg.text}</div>
                </div>
                {msg.products && msg.products.length > 0 && (
                  <div className="chat-products-list">
                    {msg.products.map((product) => (
                      <Link
                        to={`/products/${product.code}`}
                        key={product.id}
                        className="chat-product-item"
                        onClick={() => setIsOpen(false)}
                      >
                        <div className="chat-product-info">
                          <span className="chat-product-name" title={product.name}>
                            {product.name}
                          </span>
                          <div className="chat-product-details">
                            <div className="chat-product-prices">
                              <span className="chat-product-price-main">
                                {new Intl.NumberFormat("vi-VN", {
                                  style: "currency",
                                  currency: "VND",
                                }).format(Object.is(product.discountPrice, null) ? product.price : product.discountPrice)}
                              </span>
                              {!Object.is(product.discountPrice, null) && product.discountPrice !== product.price && (
                                <span className="chat-product-price-original">
                                  {new Intl.NumberFormat("vi-VN", {
                                    style: "currency",
                                    currency: "VND",
                                  }).format(product.price)}
                                </span>
                              )}
                            </div>
                            <span className="chat-product-sold">
                              Đã bán {product.soldQuantity || 0}
                            </span>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message bot">
              <div className="message-content-wrapper">
                <div className="message-text-row">
                  <div className="avatar">
                    <div className="avatar-fallback">BT</div>
                  </div>
                  <div className="message-content">
                    <LoadingOutlined /> Đang phản hồi...
                  </div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chatbox-footer">
          <form onSubmit={handleSubmit} className="chatbox-form">
            <input
              type="text"
              placeholder="Nhập tin nhắn..."
              className="chatbox-input"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <button type="submit" className="chatbox-send-btn" disabled={isLoading || !inputValue.trim()}>
              <SendOutlined />
            </button>
          </form>
        </div>
      </div>

      <style>{`
        .contact-button-wrapper {
          position: fixed;
          bottom: 100px;
          right: 16px;
          z-index: 9999;
          cursor: pointer;
          width: 54px;
          height: 54px;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: swing 2.5s ease-in-out infinite;
          opacity: 1;
          transform: scale(1) translateY(0);
          transition: transform 0.4s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease;
        }

        .contact-button-wrapper.open {
          animation: none;
          opacity: 0;
          transform: scale(0.1) translateY(20px);
          pointer-events: none;
        }

        .contact-button {
          position: relative;
          width: 50px;
          height: 50px;
          background: linear-gradient(135deg, #1a5fa8, #0e3b6e);
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          box-shadow: 0 4px 15px rgba(26, 95, 168, 0.4);
          transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), background 0.3s ease;
          z-index: 3;
        }

        .contact-button-wrapper:hover:not(.open) .contact-button {
          transform: scale(1.1);
        }

        .contact-button-wrapper:hover:not(.open) {
          animation-play-state: paused;
        }

        .contact-text {
          font-size: 8px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-top: 2px;
        }

        .pulse-ring {
          position: absolute;
          width: 90%;
          height: 90%;
          border-radius: 50%;
          background-color: rgba(26, 95, 168, 0.3);
          animation: pulse 2s cubic-bezier(0.25, 0.8, 0.25, 1) infinite;
          z-index: 1;
        }

        .contact-button-wrapper.open .pulse-ring {
          display: none;
        }

        /* --- CHATBOX MODAL STYLES --- */
        .chatbox-modal {
          position: fixed;
          bottom: 100px;
          right: 20px;
          width: 360px;
          height: 540px;
          max-height: 80vh;
          max-width: calc(100vw - 40px);
          background-color: #ffffff;
          border-radius: 20px;
          box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15), 0 2px 10px rgba(0,0,0,0.05);
          display: flex;
          flex-direction: column;
          z-index: 9998;
          transform-origin: bottom right;
          transform: scale(0.1) translateY(100px);
          opacity: 0;
          visibility: hidden;
          pointer-events: none;
          transition: transform 0.5s cubic-bezier(0.68, -0.55, 0.265, 1.55), opacity 0.4s ease, visibility 0.5s ease;
          overflow: hidden;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .chatbox-modal.active {
          transform: scale(1) translateY(0);
          opacity: 1;
          visibility: visible;
          pointer-events: auto;
        }

        .chatbox-header {
          background: linear-gradient(135deg, #1a5fa8, #154b85);
          color: white;
          padding: 40px 20px 15px 20px;
          border-radius: 20px 20px 0 0;
          position: relative;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }

        .chatbox-header-content {
          display: flex;
          align-items: center;
          gap: 12px;
          text-align: left;
        }

        .header-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background-color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          overflow: hidden;
          flex-shrink: 0;
          box-shadow: 0 2px 5px rgba(0,0,0,0.1);
        }

        .header-avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          z-index: 2;
        }

        .header-avatar .avatar-fallback {
          color: #1a5fa8;
          font-size: 15px;
          font-weight: bold;
          z-index: 1;
        }

        .chatbox-header-info {
          flex: 1;
        }

        .chatbox-header-info h4 {
          margin: 0 0 5px 0;
          font-size: 15px;
          font-weight: 600;
          letter-spacing: 0.3px;
        }

        .chatbox-header-info p {
          margin: 0;
          font-size: 12px;
          opacity: 0.85;
        }

        .chatbox-close-top-center {
          position: absolute;
          top: 3px;
          left: 50%;
          transform: translateX(-50%);
          background: rgba(255, 255, 255, 0.25);
          border: none;
          color: white;
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.3s ease;
          z-index: 10;
        }

        .chatbox-close-top-center:hover {
          background: rgba(255, 255, 255, 0.4);
          transform: translateX(-50%) rotate(90deg);
        }

        .chatbox-body {
          flex: 1;
          padding: 20px;
          background-color: #f7f9fc;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .chat-message {
          display: flex;
          align-items: flex-end;
          gap: 10px;
          max-width: 85%;
        }

        .chat-message.bot {
          align-self: flex-start;
          align-items: flex-start; /* Ensure outer wrapper aligns top */
        }

        .chat-message.user {
          align-self: flex-end;
          flex-direction: row-reverse;
        }

        .message-text-row {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .chat-message.user .message-text-row {
          justify-content: flex-end;
        }

        .chat-message .avatar {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          flex-shrink: 0;
          position: relative;
          background-color: #e0e6ed;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
        }

        .chat-message .avatar img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          position: absolute;
          z-index: 2;
        }

        .chat-message .avatar-fallback {
          color: #1a5fa8;
          font-size: 12px;
          font-weight: bold;
          z-index: 1;
        }

        .message-content-wrapper {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .chat-message.user .message-content {
          background-color: #1a5fa8;
          color: white;
          border-radius: 18px 18px 4px 18px;
          border: none;
        }

        .chat-message.bot .message-content {
          background-color: #ffffff;
          color: #333;
          border-radius: 18px 18px 18px 4px;
          border: 1px solid #edf2f7;
        }

        .message-content {
          padding: 10px 14px;
          font-size: 13.5px;
          line-height: 1.5;
          box-shadow: 0 2px 5px rgba(0,0,0,0.05);
        }

        .chat-products-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
          margin-top: 4px;
        }

        .chat-message.bot .chat-products-list {
          margin-left: 46px; /* 36px avatar + 10px gap */
        }

        .chat-product-item {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 8px 12px;
          display: flex;
          align-items: center;
          text-decoration: none;
          color: inherit;
          transition: all 0.2s;
          box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }

        .chat-product-item:hover {
          border-color: #1a5fa8;
          box-shadow: 0 3px 6px rgba(26,95,168,0.1);
          transform: translateY(-1px);
        }

        .chat-product-info {
          display: flex;
          flex-direction: column;
          width: 100%;
        }

        .chat-product-name {
          font-size: 13px;
          font-weight: 500;
          color: #2d3748;
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .chat-product-details {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-top: 4px;
        }

        .chat-product-prices {
          display: flex;
          align-items: baseline;
          gap: 6px;
        }

        .chat-product-price-main {
          font-size: 13px;
          font-weight: 700;
          color: #ff4d4f;
        }

        .chat-product-price-original {
          font-size: 11px;
          color: #8c8c8c;
          text-decoration: line-through;
        }

        .chat-product-sold {
          font-size: 11px;
          color: #595959;
        }

        .chatbox-footer {
          padding: 15px 20px;
          background-color: #ffffff;
          border-top: 1px solid #edf2f7;
        }

        .chatbox-form {
          display: flex;
          align-items: center;
          gap: 10px;
          background-color: #f7f9fc;
          border-radius: 24px;
          padding: 5px 5px 5px 15px;
          border: 1px solid #e2e8f0;
          transition: border-color 0.3s ease;
        }

        .chatbox-form:focus-within {
          border-color: #1a5fa8;
          box-shadow: 0 0 0 2px rgba(26, 95, 168, 0.1);
        }

        .chatbox-input {
          flex: 1;
          border: none;
          background: transparent;
          font-size: 14px;
          color: #333;
          outline: none;
        }

        .chatbox-input::placeholder {
          color: #a0aec0;
        }
        
        .chatbox-input:disabled {
          background: transparent;
          cursor: not-allowed;
          opacity: 0.6;
        }

        .chatbox-send-btn {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background-color: #1a5fa8;
          color: white;
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s ease;
          flex-shrink: 0;
        }

        .chatbox-send-btn:hover:not(:disabled) {
          background-color: #154b85;
        }
        
        .chatbox-send-btn:disabled {
          background-color: #a0aec0;
          cursor: not-allowed;
        }

        /* Animations */
        @keyframes pulse {
          0%   { transform: scale(0.9); opacity: 0.8; }
          100% { transform: scale(1.6);  opacity: 0; }
        }

        @keyframes swing {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(15deg); }
          35%  { transform: rotate(-15deg); }
          50%  { transform: rotate(8deg); }
          65%  { transform: rotate(-8deg); }
          80%  { transform: rotate(4deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </div>
  );
};

export default ContactButton;