import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { HiOutlineLocationMarker, HiOutlinePhone, HiOutlineMail, HiOutlineClock } from 'react-icons/hi';
import { message } from 'antd';
import { createContact } from '../../api/contact';
import './Contact.css';

const Contact = () => {
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        phone: '',
        message: ''
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.fullName || !formData.email || !formData.phone || !formData.message) {
            message.warning("Vui lòng điền đầy đủ thông tin!");
            return;
        }

        setLoading(true);
        try {
            await createContact(formData);
            message.success("Cảm ơn bạn đã liên hệ, chúng tôi sẽ phản hồi sớm nhất!");
            setFormData({ fullName: '', email: '', phone: '', message: '' });
        } catch (error) {
            message.error("Gửi liên hệ thất bại, vui lòng thử lại!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="contact-page">
            {/* Breadcrumb */}
            <div className="contact-breadcrumb">
                <Link to="/">Trang chủ</Link>
                <span className="separator">/</span>
                <span className="current">Liên hệ</span>
            </div>

            <div className="contact-content">
                {/* Left Column */}
                <div className="contact-left">
                    <h2 className="contact-title">Thông tin liên hệ</h2>
                    <div className="contact-info-grid">
                        <div className="contact-info-item">
                            <div className="contact-icon"><HiOutlineLocationMarker /></div>
                            <div className="contact-text">
                                <span className="contact-label">Địa chỉ</span>
                                <span className="contact-value">99 Hoàng Hoa Thám Phường 7 Quận Bình Thạnh</span>
                            </div>
                        </div>
                        <div className="contact-info-item">
                            <div className="contact-icon"><HiOutlineClock /></div>
                            <div className="contact-text">
                                <span className="contact-label">Thời gian làm việc</span>
                                <span className="contact-value">Thứ 2 đến Thứ 6: từ 09:00 đến 17:00</span>
                            </div>
                        </div>
                        <div className="contact-info-item">
                            <div className="contact-icon"><HiOutlinePhone /></div>
                            <div className="contact-text">
                                <span className="contact-label">Điện thoại</span>
                                <span className="contact-value">1800 6930</span>
                            </div>
                        </div>
                        <div className="contact-info-item">
                            <div className="contact-icon"><HiOutlineMail /></div>
                            <div className="contact-text">
                                <span className="contact-label">Email</span>
                                <span className="contact-value">support@bichthuymarket.vn</span>
                            </div>
                        </div>
                    </div>

                    <h2 className="contact-title mt-40">Gửi thắc mắc cho chúng tôi</h2>
                    <p className="contact-desc">Nếu bạn có bất cứ thắc mắc gì, có thể gửi yêu cầu cho chúng tôi, và chúng tôi sẽ liên lạc lại với bạn sớm nhất có thể.</p>
                    
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group full-width">
                            <input 
                                type="text" 
                                name="fullName"
                                placeholder="Tên của bạn" 
                                value={formData.fullName}
                                onChange={handleChange}
                                required 
                            />
                        </div>
                        <div className="form-row">
                            <div className="form-group half-width">
                                <input 
                                    type="email" 
                                    name="email"
                                    placeholder="Email của bạn" 
                                    value={formData.email}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                            <div className="form-group half-width">
                                <input 
                                    type="tel" 
                                    name="phone"
                                    placeholder="Số điện thoại của bạn" 
                                    value={formData.phone}
                                    onChange={handleChange}
                                    required 
                                />
                            </div>
                        </div>
                        <div className="form-group full-width">
                            <textarea 
                                name="message"
                                placeholder="Nội dung" 
                                rows="5" 
                                value={formData.message}
                                onChange={handleChange}
                                required
                            ></textarea>
                        </div>
                        <p className="captcha-text">
                            This site is protected by reCAPTCHA and the Google <a href="#">Privacy Policy</a> and <a href="#">Terms of Service</a> apply.
                        </p>
                        <button type="submit" className="contact-submit-btn" disabled={loading}>
                            {loading ? "ĐANG GỬI..." : "GỬI CHO CHÚNG TÔI"}
                        </button>
                    </form>
                </div>

                {/* Right Column (Map) */}
                <div className="contact-right">
                    <iframe 
                        src="https://www.google.com/maps?q=99+Hoàng+Hoa+Thám,+Phường+7,+Quận+Bình+Thạnh,+Hồ+Chí+Minh&hl=vi&z=16&output=embed"
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen="" 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                        title="Google Map"
                    ></iframe>
                </div>
            </div>
        </div>
    );
};

export default Contact;
