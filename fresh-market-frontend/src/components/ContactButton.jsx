import React from "react";
import { CommentOutlined } from "@ant-design/icons";

const ContactButton = () => {
  const handleClick = () => {
    // Thêm logic mở chat hoặc cuộn xuống phần liên hệ ở đây
  };

  return (
    <>
      <div className="contact-button-wrapper" onClick={handleClick}>
        <div className="pulse-ring"></div>
        <div className="contact-button">
          <CommentOutlined className="contact-icon" />
          <span className="contact-text">Liên hệ</span>
        </div>
      </div>

      <style>{`
        .contact-button-wrapper {
          position: fixed;
          bottom: 100px; 
          right: 10px; 
          z-index: 999;
          cursor: pointer;
          display: flex;
          justify-content: center;
          align-items: center;
          width: 60px;
          height: 60px;
        }

        .contact-button {
          position: relative;
          width: 54px;
          height: 54px;
          background-color: #0d47a1;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
          color: white;
          transition: transform 0.3s ease;
          z-index: 2;
        }

        .contact-icon {
          font-size: 22px;
          margin-bottom: -2px;
        }

        .contact-text {
          font-size: 10px;
          font-weight: 500;
          text-transform: uppercase;
        }

        .contact-button-wrapper:hover .contact-button {
          transform: scale(1.1);
          background-color: #1565c0;
        }

        /* Pulse Animation */
        .pulse-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border-radius: 50%;
          background-color: rgba(13, 71, 161, 0.4);
          animation: pulse 2s infinite;
          z-index: 1;
        }

        @keyframes pulse {
          0% {
            transform: scale(0.8);
            opacity: 1;
          }
          100% {
            transform: scale(1.5);
            opacity: 0;
          }
        }

        /* Floating Animation for the whole wrapper */
        .contact-button-wrapper {
          animation: floating 3s ease-in-out infinite;
        }

        @keyframes floating {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </>
  );
};

export default ContactButton;
