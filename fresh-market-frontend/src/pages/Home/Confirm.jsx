import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message, Spin } from 'antd';
import { 
  FaCheck, FaUser, FaCreditCard, FaMapMarkerAlt, 
  FaFileInvoice, FaShoppingBag, FaArrowRight 
} from 'react-icons/fa';
import { getOneByOrderId, getOrderById, exportInvoicePdf } from '../../api/order';
import { clearCart } from '../../api/cart';
import { getToken } from '../../services/localStorageService';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';
import './Confirm.css';

const Confirm = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');
  
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const user = useSelector((state) => state.user);


  useEffect(() => {
    const errorParam = searchParams.get('error');
    if (errorParam) {
      const code = searchParams.get('code');
      let errorMsg = "Thanh toán thất bại!";
      if (errorParam === 'invalid_signature') errorMsg = "Chữ ký không hợp lệ!";
      else if (errorParam === 'payment_failed') errorMsg = `Thanh toán thất bại! Mã lỗi: ${code}`;
      
      message.error(errorMsg);
      navigate('/checkout'); // Redirect back to checkout or show error page
      return;
    }

    const fetchOrder = async () => {
      if (!orderId) {
        message.error("Không tìm thấy mã đơn hàng!");
        navigate('/');
        return;
      }

      try {
        let orderData;
        const token = getToken();

        if (token) {
          try {
            orderData = await getOneByOrderId(orderId);
          } catch (error) {
            orderData = await getOrderById(orderId);
          }
        } else {
          orderData = await getOrderById(orderId);
        }

        if (orderData) {
          setOrder(orderData);
        } else {
          throw new Error("Không có dữ liệu đơn hàng");
        }
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
        message.error("Không thể tải thông tin đơn hàng.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
    
    // Clear cart UI/Local storage if successful landing with orderId
    if (orderId) {
      if (!getToken()) {
        localStorage.removeItem('guestCart');
      }
      window.dispatchEvent(new Event('cartUpdated'));
    }

    window.scrollTo(0, 0);
  }, [orderId, navigate, searchParams, user?.id]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size="large" description="Đang tải thông tin đơn hàng..." />
      </div>
    );
  }

  if (!order) return null;

  const subtotal = order.details.reduce((sum, item) => sum + (item.priceAtPurchase * item.quantity), 0);
  const shippingFee = order.totalPrice - subtotal;

  const handleExportInvoice = async () => {
    try {
      message.loading({ content: 'Đang chuẩn bị hóa đơn...', key: 'exporting' });
      const blob = await exportInvoicePdf(order.id);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `hoa-don-${order.id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
      message.success({ content: 'Tạo hóa đơn thành công!', key: 'exporting' });
    } catch (error) {
      console.error("Lỗi tạo hóa đơn:", error);
      message.error({ content: 'Không thể tạo hóa đơn. Vui lòng thử lại!', key: 'exporting' });
    }
  };

  return (
    <div className="confirm-container">

      {/* 1. Header Banner - Matching Image 1 */}
      <div className="confirm-header-banner">
        <div className="success-icon-circle">
          <FaCheck />
        </div>
        <h1 className="confirm-title">Cảm ơn bạn đã đặt hàng!</h1>
        <p className="confirm-email-info">
          Email xác nhận đã được gửi tới <strong>{order?.username || 'email của bạn'}</strong>
        </p>
        <div className="order-id-badge">
          Đơn hàng #{order.id}
        </div>
      </div>

      {/* 3. Main Content Two-Column Layout */}
      <div className="confirm-content-grid">
        
        {/* Left Column: Info Cards - Matching Image 2 */}
        <div className="confirm-left-col">
          
          {/* Purchase Info */}
          <div className="info-card">
            <div className="info-card-header">
              <FaUser /> Thông tin mua hàng
            </div>
            <div className="info-card-body">
              <div className="info-group">
                <div className="info-label">Họ và tên:</div>
                <div className="info-value">{order?.fullName}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Email:</div>
                <div className="info-value">{order?.username || 'N/A'}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Số điện thoại:</div>
                <div className="info-value">{order?.phone}</div>
              </div>
            </div>
          </div>

          {/* Payment Method */}
          <div className="info-card">
            <div className="info-card-header">
              <FaCreditCard /> Phương thức thanh toán
            </div>
            <div className="info-card-body">
              <div className="info-value">{order.paymentMethod}</div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="info-card">
            <div className="info-card-header">
              <FaMapMarkerAlt /> Địa chỉ nhận hàng
            </div>
            <div className="info-card-body">
              <div className="info-group">
                <div className="info-label">Họ và tên:</div>
                <div className="info-value">{order?.fullName}</div>
              </div>
              <div className="info-group">
                <div className="info-label">Địa chỉ:</div>
                <div className="info-value">
                  {`${order?.address}`}
                </div>
              </div>
              <div className="info-group">
                <div className="info-label">Số điện thoại:</div>
                <div className="info-value">{order?.phone}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary - Matching Image 3 */}
        <div className="confirm-right-col">
          <div className="order-items-list">
            {order.details.map((item, index) => (
              <div key={index} className="order-item-row">
                <div className="item-img-container">
                  {/* Backend may need to include images in order detail response */}
                  <img src={item.productImage ? `${IMAGE_URL}/${item.productImage}` : DEFAULT_IMAGE} alt={item.productName} />
                  <span className="item-qty-tag">{item.quantity}</span>
                </div>
                <div className="item-main-info">
                  <div className="item-name-text">{item.productName}</div>
                  <div className="item-unit-text">Set</div>
                </div>
                <div className="item-price-text">
                  {(item.priceAtPurchase * item.quantity).toLocaleString()}đ
                </div>
              </div>
            ))}
          </div>

          <div className="totals-area">
            <div className="total-row">
              <span>Tạm tính | Temporarily calculated</span>
              <span>{subtotal.toLocaleString()}đ</span>
            </div>
            <div className="total-row">
              <span>Phí vận chuyển | Shipping fee</span>
              <span>{shippingFee > 0 ? shippingFee.toLocaleString() : '0'}đ</span>
            </div>
            <div className="total-row grand-total">
              <div className="grand-total-label">
                Tổng cộng | Total
              </div>
              <div className="grand-total-value">
                <span style={{ marginRight: '5px', color: '#64748b', fontSize: '14px' }}>VND</span> {order.totalPrice.toLocaleString()}đ
              </div>
            </div>
          </div>

          {/* 2. Horizontal Action Buttons */}
          <div className="confirm-actions-row">
            <button className="btn-action-outline" onClick={handleExportInvoice}>
              <FaFileInvoice /> Xuất hóa đơn
            </button>
            <button className="btn-action-primary" onClick={() => navigate('/')}>
              Tiếp tục mua hàng 
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Confirm;
