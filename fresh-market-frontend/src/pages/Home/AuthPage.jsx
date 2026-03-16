import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch } from "react-redux";
import { login, introspect } from "../../api/auth";
import { createUser } from "../../api/user";
import { getToken } from "../../services/localStorageService";
import './AuthPage.css';

const AuthPage = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.pathname !== '/register');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const token = getToken();

  // Redirect if already logged in
  useEffect(() => {
    const checkTokenValidity = async () => {
      try {
        const isValid = await introspect(token);
        if (isValid) navigate("/");
      } catch (error) {
        console.error(error.message);
      }
    };

    if (token) {
      checkTokenValidity();
    }
  }, [navigate, token]);

  // Sync isLogin with pathname
  useEffect(() => {
    setIsLogin(location.pathname !== '/register');
  }, [location.pathname]);

  // Login State
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Register State
  const [regFullName, setRegFullName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regGender, setRegGender] = useState("");
  const [regDob, setRegDob] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [showRegPassword, setShowRegPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    const data = {
      username: loginEmail,
      password: loginPassword,
    };
    login(data, navigate, dispatch);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const data = {
      username: regEmail,
      password: regPassword,
      fullName: regFullName,
      phone: regPhone,
      gender: regGender,
      dob: regDob,
      roles: ["CUSTOMER"]
    };
    try {
      await createUser(data);
      // Auto switch to login
      navigate('/login');
      setLoginEmail(regEmail);
    } catch (error) {
      // Error is handled in user.js (message.error)
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="auth-header">
          <span 
            className={`auth-tab ${isLogin ? 'active' : ''}`} 
            onClick={() => navigate('/login')}
          >
            Đăng nhập
          </span>
          <span className="auth-separator">|</span>
          <span 
            className={`auth-tab ${!isLogin ? 'active' : ''}`} 
            onClick={() => navigate('/register')}
          >
            Đăng ký
          </span>
        </div>

        {isLogin ? (
          <form className="auth-form" onSubmit={handleLogin}>
            <input 
              type="email" 
              placeholder="Vui lòng nhập email của bạn" 
              className="auth-input" 
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              required 
            />
            <div className="auth-password-wrapper">
              <input 
                type={showLoginPassword ? "text" : "password"} 
                placeholder="Vui lòng nhập mật khẩu" 
                className="auth-input" 
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                required 
              />
              <span 
                className="auth-toggle-password" 
                onClick={() => setShowLoginPassword(!showLoginPassword)}
              >
                {showLoginPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </span>
            </div>
            
            <p className="auth-recaptcha-text">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.
            </p>

            <div className="auth-footer">
              <button type="submit" className="auth-btn">ĐĂNG NHẬP</button>
              <div className="auth-links">
                <p>Khách hàng mới? <span className="auth-link-action" onClick={() => navigate('/register')}>Đăng ký</span></p>
                <p>Quên mật khẩu? <span className="auth-link-action" onClick={() => navigate('/forgot-password')}>Khôi phục mật khẩu</span></p>
              </div>
            </div>
          </form>
        ) : (
          <form className="auth-form" onSubmit={handleRegister}>
            <input 
              type="text" 
              placeholder="Họ tên" 
              className="auth-input" 
              value={regFullName}
              onChange={(e) => setRegFullName(e.target.value)}
              required 
            />
            <input 
              type="text" 
              placeholder="Số điện thoại" 
              className="auth-input" 
              value={regPhone}
              onChange={(e) => setRegPhone(e.target.value)}
              required 
            />
            
            <div className="auth-gender">
              <label>
                <input 
                  type="radio" 
                  name="gender" 
                  value="Nam" 
                  checked={regGender === "Nam"}
                  onChange={(e) => setRegGender(e.target.value)} 
                /> Nam
              </label>
              <label>
                <input 
                  type="radio" 
                  name="gender" 
                  value="Nữ" 
                  checked={regGender === "Nữ"}
                  onChange={(e) => setRegGender(e.target.value)} 
                /> Nữ
              </label>
            </div>
            
            <input 
              type="date" 
              placeholder="mm/dd/yyyy" 
              className="auth-input date-input" 
              value={regDob}
              onChange={(e) => setRegDob(e.target.value)}
            />
            <input 
              type="email" 
              placeholder="Email" 
              className="auth-input" 
              value={regEmail}
              onChange={(e) => setRegEmail(e.target.value)}
              required 
            />
            <div className="auth-password-wrapper">
              <input 
                type={showRegPassword ? "text" : "password"} 
                placeholder="Mật khẩu" 
                className="auth-input" 
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                required 
              />
              <span 
                className="auth-toggle-password" 
                onClick={() => setShowRegPassword(!showRegPassword)}
              >
                {showRegPassword ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                    <line x1="1" y1="1" x2="23" y2="23"></line>
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                    <circle cx="12" cy="12" r="3"></circle>
                  </svg>
                )}
              </span>
            </div>
            
            <p className="auth-recaptcha-text">
              This site is protected by reCAPTCHA and the Google{' '}
              <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.
            </p>

            <div className="auth-footer">
              <button type="submit" className="auth-btn">ĐĂNG KÝ</button>
              <div className="auth-links flex-row">
                <p>Bạn đã có tài khoản? <span className="auth-link-action" onClick={() => navigate('/login')}>Đăng nhập ngay</span></p>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default AuthPage;
