import React from 'react';
import { IMAGE_URL } from '../../api/auth';

const Footer = () => {
  return (
    <footer className="footer-container py-4 border-top" style={{ backgroundColor: '#fafafa', color: '#555', fontSize: '14px' }}>
      <div className="container-fluid px-4 px-lg-5">
        
        {/* Top Section */}
        <div className="row justify-content-between align-items-start border-bottom pb-4 mb-4">
          <div className="col-md-9 col-lg-10">
            <h6 className="fw-bold text-dark mb-1" style={{ fontSize: '15px' }}>Bản quyền của Công Ty TNHH Thương Mại Laria</h6>
            <p className="mb-1">Giấy chứng nhận Đăng ký Kinh doanh số 0312461711 do Sở KH&ĐT TP HCM cấp ngày 17/09/2013.</p>
            <p className="mb-1">Địa chỉ: 496 - 496A - 496B Nguyễn Thị Minh Khai, Phường 2, Quận 3, TP HCM. Đăng ký thay đổi lần 4 ngày 14/05/2020.</p>
            <p className="mb-0">Công ty TNHH Thương mại Laria. Số 73/GP-PKT cấp ngày 16/12/2019.</p>
          </div>
          <div className="col-md-3 col-lg-2 text-md-end mt-3 mt-md-0">
            <img 
              src={`${IMAGE_URL}/bo_cong_thuong.png`} 
              alt="Đã thông báo bộ công thương" 
              style={{ maxHeight: '45px' }}
              onError={(e) => { e.target.style.display = 'none'; }}
            />
          </div>
        </div>

        {/* Middle Section: Links */}
        <div className="row pb-4 border-bottom mb-4">
          {/* Contact Info */}
          <div className="col-lg-3 col-md-6 mb-4 mb-lg-0">
            <h6 className="fw-bold text-dark text-uppercase mb-3">Thông tin liên hệ</h6>
            <ul className="list-unstyled mb-0">
              <li className="d-flex mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 mt-1 flex-shrink-0 text-dark">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                  <circle cx="12" cy="10" r="3"></circle>
                </svg>
                <span>99 Hoàng Hoa Thám, Phường 7, Bình Thạnh, TPHCM</span>
              </li>
              <li className="d-flex mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 mt-1 flex-shrink-0 text-dark">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
                <span>1800 6930</span>
              </li>
              <li className="d-flex">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="me-2 mt-1 flex-shrink-0 text-dark">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                <span>support@bichthuymarket.vn</span>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="col-lg-5 col-md-6 mb-4 mb-lg-0">
            <h6 className="fw-bold text-dark text-uppercase mb-3">HỖ TRỢ KHÁCH HÀNG</h6>
            <div className="row">
              <div className="col-sm-4">
                <ul className="list-unstyled mb-0 gap-2 d-flex flex-column">
                  <li><a href="#" className="text-decoration-none text-muted" style={{ transition: 'color 0.2s' }}>Chính Sách Giao Hàng</a></li>
                  <li><a href="#" className="text-decoration-none text-muted" style={{ transition: 'color 0.2s' }}>Chính Sách Đổi Trả</a></li>
                </ul>
              </div>
              <div className="col-sm-4">
                <ul className="list-unstyled mb-0 gap-2 d-flex flex-column">
                  <li><a href="#" className="text-decoration-none text-muted">Chính Sách Thành Viên</a></li>
                  <li><a href="#" className="text-decoration-none text-muted">Hướng Dẫn Mua Hàng Và Hoàn Tiền</a></li>
                </ul>
              </div>
              <div className="col-sm-4">
                <ul className="list-unstyled mb-0 gap-2 d-flex flex-column">
                  <li><a href="#" className="text-decoration-none text-muted">Chính Sách Xuất Hóa Đơn</a></li>
                </ul>
              </div>
            </div>
          </div>

          {/* About Us */}
          <div className="col-lg-4 col-md-12">
            <h6 className="fw-bold text-dark text-uppercase mb-3">VỀ BICH THUY MARKET</h6>
            <div className="row">
              <div className="col-sm-4">
                <ul className="list-unstyled mb-0 gap-2 d-flex flex-column">
                  <li><a href="#" className="text-decoration-none text-muted">Hệ Thống Cửa Hàng</a></li>
                  <li><a href="#" className="text-decoration-none text-muted">Giới Thiệu</a></li>
                </ul>
              </div>
              <div className="col-sm-4">
                <ul className="list-unstyled mb-0 gap-2 d-flex flex-column">
                  <li><a href="#" className="text-decoration-none text-muted">Chính Sách Quyền Riêng Tư</a></li>
                  <li><a href="#" className="text-decoration-none text-muted">Giấy Chứng Nhận Vệ Sinh ATTP</a></li>
                </ul>
              </div>
              <div className="col-sm-4">
                <ul className="list-unstyled mb-0 gap-2 d-flex flex-column">
                  <li><a href="#" className="text-decoration-none text-muted">Giấy Phép Bán Rượu</a></li>
                  <li><a href="/contact" className="text-decoration-none text-muted">Liên Hệ</a></li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Follow Us Section */}
        <div className="pb-4 border-bottom mb-4">
          <h6 className="fw-bold text-dark text-uppercase mb-3">THEO DÕI CHÚNG TÔI</h6>
          <div className="d-flex flex-wrap gap-3 gap-md-4">
            <a href="#" className="text-decoration-none text-muted">Website Siêu Thị Bich Thuy Market</a>
            <a href="#" className="text-decoration-none text-muted">Cửa Hàng FaceBook</a>
            <a href="#" className="text-decoration-none text-muted">Zalo Bich Thuy Market OA</a>
            <a href="#" className="text-decoration-none text-muted">Liên Hệ Hợp Tác & Chào Hàng: Merchandise@bichthuymarket.vn</a>
          </div>
        </div>

        {/* Bottom Bar: Copyright & Socials */}
        <div className="d-flex flex-column flex-md-row justify-content-between align-items-center pt-2">
          <p className="mb-3 mb-md-0 text-muted">Copyright © 2026 BICH THUY MARKET. Powered by Haravan</p>
          <div className="d-flex gap-2">
            {/* Twitter/X */}
            <a href="#" className="text-dark bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            {/* Instagram */}
            <a href="#" className="text-dark bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
              </svg>
            </a>
            {/* LinkedIn */}
            <a href="#" className="text-dark bg-dark text-white rounded-circle d-flex align-items-center justify-content-center" style={{ width: '32px', height: '32px' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="0" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect x="2" y="9" width="4" height="12"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;
