import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { FaHome, FaExclamationTriangle } from 'react-icons/fa';

export default function NotFound() {
  const navigate = useNavigate();
  const location = useLocation();

  const handleReturn = () => {
    if (location.pathname.startsWith("/admin")) {
      navigate("/admin");
    } else {
      navigate("/");
    }
  };
  
  const returnText = location.pathname.startsWith("/admin") ? "Về trang Admin" : "Về trang chủ";

  return (
    <div className="container d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '70vh', padding: '100px 20px' }}>
      <div className="text-center">
        <div style={{ fontSize: '120px', fontWeight: '900', color: '#f0f0f0', marginBottom: '-50px' }}>404</div>
        <FaExclamationTriangle style={{ fontSize: '80px', color: '#ffb300', marginBottom: '20px', position: 'relative', zIndex: 1 }} />
        <h2 className="fw-bold mb-3" style={{ color: '#333' }}>Xin lỗi, trang bạn truy cập không tồn tại!</h2>
        <p className="text-muted mb-4" style={{ fontSize: '16px', maxWidth: '450px', margin: '0 auto' }}>
          Địa chỉ bạn đang truy cập không tồn tại hoặc đã bị gỡ bỏ. 
          Vui lòng quay lại hoặc liên hệ với chúng tôi nếu đây là một lỗi.
        </p>
        <button 
          className="btn d-inline-flex align-items-center gap-2" 
          onClick={handleReturn}
          style={{ 
            backgroundColor: '#004aad', 
            color: '#fff', 
            padding: '10px 24px', 
            borderRadius: '50px',
            fontWeight: '600',
            border: 'none',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 15px rgba(0, 74, 173, 0.2)'
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#003a8c';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#004aad';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <FaHome /> {returnText}
        </button>
      </div>
    </div>
  );
}