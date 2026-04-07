import React from "react";

const ContactButton = () => {
  const handleClick = () => {
    // Thêm logic mở chat hoặc cuộn xuống phần liên hệ
  };

  return (
    <>
      <div className="contact-button-wrapper" onClick={handleClick}>
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

      <style>{`
        .contact-button-wrapper {
          position: fixed;
          bottom: 100px;
          right: 14px;
          z-index: 999;
          cursor: pointer;
          width: 54px;
          height: 54px;
          display: flex;
          justify-content: center;
          align-items: center;
          animation: swing 2.5s ease-in-out infinite;
        }

        .contact-button {
          position: relative;
          width: 50px;
          height: 50px;
          background-color: #1a5fa8;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          color: white;
          transition: transform 0.25s ease, background-color 0.25s ease;
          z-index: 3;
        }

        .contact-button-wrapper:hover .contact-button {
          background-color: #1565c0;
        }

        .contact-button-wrapper:hover {
          animation-play-state: paused;
        }

        .contact-text {
          font-size: 9px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.3px;
          margin-top: 2px;
        }

        .pulse-ring {
          position: absolute;
          width: 85%;
          height: 85%;
          border-radius: 50%;
          background-color: rgba(26, 95, 168, 0.45);
          animation: pulse 2s ease-out infinite;
        }

        @keyframes pulse {
          0%   { transform: scale(0.85); opacity: 0.9; }
          100% { transform: scale(1.7);  opacity: 0; }
        }

        @keyframes swing {
          0%   { transform: rotate(0deg); }
          15%  { transform: rotate(20deg); }
          35%  { transform: rotate(-20deg); }
          50%  { transform: rotate(10deg); }
          65%  { transform: rotate(-10deg); }
          80%  { transform: rotate(5deg); }
          100% { transform: rotate(0deg); }
        }
      `}</style>
    </>
  );
};

export default ContactButton;