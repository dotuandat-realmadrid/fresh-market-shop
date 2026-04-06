import React, { useState, useEffect, useCallback } from 'react';
import { 
  Input, Select, Radio, Button, message, 
  Divider, Space, Breadcrumb, Tag, Modal 
} from 'antd';
import { 
  FaHome, FaCreditCard, FaMoneyBillWave, FaWallet, 
  FaStore, FaTruck, FaChevronLeft, FaCheckCircle,
  FaTags, FaTicketAlt
} from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { getCartByUser, clearCart } from '../../api/cart';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';
import { getToken } from '../../services/localStorageService';
import { createOrder } from '../../api/order';
import { createAddress, getAddressesByUserId } from '../../api/address';
import { initiateVNPay } from '../../api/payment';
import { createGuest } from '../../api/user';
import './Checkout.css';

const { Option } = Select;

const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((state) => state.user);
  const token = getToken();
  
  const [loading, setLoading] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [selectedAddress, setSelectedAddress] = useState('new');
  const note = location.state?.note || '';
  const [addresses, setAddresses] = useState([]);

  const [formData, setFormData] = useState({
    email: '',
    name: '',
    phone: '',
    city: '',
    district: '',
    ward: '',
    addressDetail: ''
  });
  
  // Tải danh sách địa chỉ thực từ API
  useEffect(() => {
    const loadAddresses = async () => {
      if (user?.id) {
        const result = await getAddressesByUserId(user.id);
        if (result) {
            setAddresses(result);
            if (result.length > 0) {
                setSelectedAddress(result[0].id);
            }
        }
      }
    };
    loadAddresses();
  }, [user.id]);

  // Update formData when address changes
  useEffect(() => {
    if (selectedAddress === 'new') {
      setFormData(prev => ({
        ...prev,
        email: user?.username || '',
        name: '',
        phone: '',
        city: '',
        district: '',
        ward: '',
        addressDetail: ''
      }));
    } else {
      const addr = addresses.find(a => a.id === selectedAddress);
      if (addr) {
        setFormData({
            email: user?.username || '',
            name: addr.fullName,
            phone: addr.phone,
            city: addr.province,
            district: addr.district,
            ward: addr.ward,
            addressDetail: addr.detail
        });
      }
    }
  }, [selectedAddress, user, addresses]);

  const isNewAddress = selectedAddress === 'new';
  const [modal, contextHolder] = Modal.useModal();
  const [messageApi, messageContextHolder] = message.useMessage();

  const handleFormChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const loadCart = useCallback(async () => {
    // Ưu tiên load từ session giỏ hàng đã filter inventory hoặc server
    if (token && user.id) {
       try {
        setLoading(true);
        const result = await getCartByUser(user.id);
        const rawItems = result?.cartItems || result?.items || [];
        const items = rawItems.map((item) => ({
          id: item.productId || item.id,
          productId: item.productId || item.id, // Giữ lại productId gốc
          name: item.productName || item.name,
          price: item.discountPrice || item.price,
          quantity: item.quantity,
          image: item.images?.[0] ? `${IMAGE_URL}/${item.images[0]}` : DEFAULT_IMAGE,
        }));
        setCartItems(items);
      } catch (error) {
        console.error("Không thể tải giỏ hàng user");
      } finally {
        setLoading(false);
      }
    } else {
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
      setCartItems(guestCart.items.map(it => ({
          ...it,
          id: it.productId,
          productId: it.productId, // Giữ lại productId gốc
          name: it.productName || it.name,
          price: it.discountPrice || it.price,
          image: it.images?.[0] ? `${IMAGE_URL}/${it.images[0]}` : DEFAULT_IMAGE,
      })));
    }
  }, [user.id, token]);

  useEffect(() => {
    loadCart();
    window.scrollTo(0, 0);
  }, [loadCart]);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const shippingFee = 0; 
  const total = subtotal + shippingFee;

  const handleCompleteOrder = async () => {
    if (cartItems.length === 0) {
        messageApi.warning("Giỏ hàng của bạn đang trống");
        return;
    }

    if (!formData.name || !formData.phone || !formData.city || !formData.district || !formData.ward || !formData.addressDetail) {
      messageApi.error("Vui lòng điền đầy đủ thông tin giao hàng!");
      return;
    }

    modal.confirm({
        title: 'Xác nhận đặt hàng',
        content: `Tổng thanh toán: ${total.toLocaleString()}đ qua phương thức ${paymentMethod}. Bạn có chắc chắn muốn đặt hàng?`,
        okText: 'Xác nhận',
        cancelText: 'Hủy',
        onOk: async () => {
            const hide = messageApi.loading("Đang xử lý đơn hàng...", 0);
            try {
                let finalUserId = user.id || null;
                let finalAddressId = selectedAddress;

                // 1. Nếu chưa đăng nhập, tạo tài khoản Guest trước
                if (!token) {
                    const guestData = {
                        username: formData.email,
                        fullName: formData.name,
                        phone: formData.phone
                    };
                    const guestResult = await createGuest(guestData);
                    if (guestResult?.id) {
                        finalUserId = guestResult.id;
                    } else {
                        throw new Error("Không thể tạo tài khoản khách");
                    }
                }

                // 2. Nếu là địa chỉ mới (hoặc là khách), hãy lưu địa chỉ trước
                if (isNewAddress || !token) {
                    const addrData = {
                        userId: finalUserId,
                        fullName: formData.name,
                        phone: formData.phone,
                        province: formData.city,
                        district: formData.district,
                        ward: formData.ward,
                        detail: formData.addressDetail,
                    };
                    const savedAddr = await createAddress(addrData);
                    if (savedAddr?.id) {
                        finalAddressId = savedAddr.id;
                    } else {
                        throw new Error("Không thể lưu địa chỉ giao hàng");
                    }
                }

                // 3. Chuẩn bị dữ liệu đơn hàng
                const details = cartItems.map(it => ({
                    productId: it.productId,
                    quantity: it.quantity,
                    priceAtPurchase: it.discountPrice || it.price
                }));

                const orderRequest = {
                    userId: finalUserId,
                    orderType: 'ONLINE',
                    totalPrice: total,
                    paymentMethod: paymentMethod,
                    note: note,
                    addressId: finalAddressId,
                    details: details
                };

                // 4. Xử lý theo phương thức thanh toán
                if (['ATM', 'E_WALLET', 'CREDIT_CARD', 'MOMO'].includes(paymentMethod)) {
                    // Thanh toán qua VNPay
                    const paymentResp = await initiateVNPay({
                        amount: total,
                        orderData: JSON.stringify(orderRequest)
                    });

                    if (paymentResp.code === 1000 && paymentResp.result) {
                        window.location.href = paymentResp.result; // Chuyển hướng sang VNPay
                    } else {
                        throw new Error(paymentResp.message || "Khởi tạo thanh toán thất bại");
                    }
                } else {
                    // Thanh toán COD hoặc Tiền mặt
                    const orderResp = await createOrder(orderRequest);
                    if (orderResp?.result?.id) {
                        messageApi.success("Đặt hàng thành công!");
                        // Xóa giỏ hàng sau khi đặt thành công
                        if (token && user.id) {
                            await clearCart(user.id);
                        } else {
                            localStorage.removeItem('guestCart');
                        }
                        window.dispatchEvent(new Event('cartUpdated'));
                        navigate(`/confirm?orderId=${orderResp.result.id}`);
                    } else {
                        throw new Error("Không thể tạo đơn hàng");
                    }
                }
            } catch (error) {
                console.error("Lỗi đặt hàng:", error);
                messageApi.error(error.message || "Đã có lỗi xảy ra khi đặt hàng");
            } finally {
                hide();
            }
        }
    });
  };

  return (
    <div className="checkout-container">
      {contextHolder}
      {messageContextHolder}
      <div className="checkout-layout">
        
        {/* LEFT COLUMN: Shipping & Payment */}
        <div className="checkout-left">
          
          <div className="checkout-section">
            <h2 className="section-title"><FaHome /> Địa chỉ giao hàng</h2>
            
            {/* Address Selector - Only show for authenticated users */}
            {token && (
              <div className="address-selector-row">
                <span className="address-label" style={{ display: 'block', marginBottom: '8px' }}>Chọn địa chỉ có sẵn:</span>
                <Select 
                  style={{ width: '100%' }}
                  value={selectedAddress} 
                  onChange={(val) => setSelectedAddress(val)}
                  className="address-select"
                  suffixIcon={<FaChevronLeft style={{ transform: 'rotate(-90deg)' }} />}
                >
                  {addresses.map(addr => (
                    <Option key={addr.id} value={addr.id}>
                      {`${addr.fullName} | ${addr.phone} | ${addr.detail}, ${addr.ward}, ${addr.district}, ${addr.province}`}
                    </Option>
                  ))}
                  <Option value="new">+ Thêm địa chỉ mới</Option>
                </Select>
              </div>
            )}

            {/* Form Fields */}
            <div className="address-form-wrapper">
              <p className="form-subtitle">Thông tin người nhận</p>
              <div className="checkout-form-grid">
                <div>
                  <label className="address-label">Email</label>
                  <Input 
                    value={formData.email} 
                    onChange={e => handleFormChange('email', e.target.value)}
                    disabled={!!token}
                    readOnly={!!token}
                  />
                </div>
                <div>
                  <label className="address-label">Họ và tên</label>
                  <Input 
                    value={formData.name} 
                    onChange={e => handleFormChange('name', e.target.value)}
                    disabled={!isNewAddress}
                    readOnly={!isNewAddress} 
                  />
                </div>
                <div>
                  <label className="address-label">Số điện thoại</label>
                  <Input 
                    value={formData.phone} 
                    onChange={e => handleFormChange('phone', e.target.value)}
                    disabled={!isNewAddress}
                    readOnly={!isNewAddress} 
                  />
                </div>
              </div>

              <p className="form-subtitle">Địa chỉ giao hàng</p>
              <div className="checkout-form-grid">
                <div>
                  <label className="address-label">Tỉnh/Thành phố</label>
                  <Input 
                    value={formData.city} 
                    onChange={e => handleFormChange('city', e.target.value)}
                    disabled={!isNewAddress}
                    readOnly={!isNewAddress} 
                  />
                </div>
                <div>
                  <label className="address-label">Quận/Huyện</label>
                  <Input 
                    value={formData.district} 
                    onChange={e => handleFormChange('district', e.target.value)}
                    disabled={!isNewAddress}
                    readOnly={!isNewAddress} 
                  />
                </div>
                <div>
                  <label className="address-label">Phường/Xã</label>
                  <Input 
                    value={formData.ward} 
                    onChange={e => handleFormChange('ward', e.target.value)}
                    disabled={!isNewAddress}
                    readOnly={!isNewAddress} 
                  />
                </div>
                <div className="full-width-item">
                  <label className="address-label">Địa chỉ cụ thể</label>
                  <Input 
                    value={formData.addressDetail} 
                    onChange={e => handleFormChange('addressDetail', e.target.value)}
                    disabled={!isNewAddress}
                    readOnly={!isNewAddress} 
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="checkout-section">
            <h2 className="section-title"><FaCreditCard /> Phương thức thanh toán</h2>
            
            <Radio.Group 
              onChange={e => setPaymentMethod(e.target.value)} 
              value={paymentMethod}
              className="payment-methods-list"
            >
              {[
                { id: 'COD', label: 'Thanh toán khi nhận hàng (COD)', icon: <FaTruck style={{marginRight: 8}}/> },
                { id: 'CREDIT_CARD', label: 'Thanh toán bằng thẻ tín dụng', icon: <FaCreditCard style={{marginRight: 8}}/>, icons: ['src/assets/images/credit_card.png'] },
                { id: 'ATM', label: 'Thanh toán bằng thẻ ATM', icon: <FaCreditCard style={{marginRight: 8}}/> },
                { id: 'E_WALLET', label: 'Ví điện tử (VnPay, ZaloPay, ...)', icon: <FaWallet style={{marginRight: 8}}/> },
                { id: 'MOMO', label: 'Thanh toán bằng Momo', icon: <FaWallet style={{marginRight: 8}}/> },
                { id: 'CASH', label: 'Tiền mặt tại cửa hàng', icon: <FaMoneyBillWave style={{marginRight: 8}}/> },
              ].map(method => (
                <label 
                  key={method.id} 
                  className={`payment-item-wrapper ${paymentMethod === method.id ? 'active' : ''}`}
                >
                  <Radio value={method.id} />
                  <div className="payment-content">
                    {typeof method.icon === 'string' ? <span>{method.icon}</span> : method.icon}
                    <span>{method.label}</span>
                    {method.icons && (
                      <div className="payment-icons">
                        {method.icons.map((ic, idx) => <img key={idx} src={ic} alt="card" />)}
                      </div>
                    )}
                  </div>
                </label>
              ))}
            </Radio.Group>
          </div>
        </div>

        {/* RIGHT COLUMN: Order Summary */}
        <div className="checkout-right">
          <div className="order-summary-card">
            <div className="checkout-items-list">
              {cartItems.map(item => (
                <div key={item.id} className="checkout-item">
                  <div className="item-img-box">
                    <img src={item.image} alt={item.name} />
                    <span className="item-qty-badge">{item.quantity}</span>
                  </div>
                  <div className="item-name">{item.name}</div>
                  <div className="item-price">{item.price?.toLocaleString()}đ</div>
                </div>
              ))}
              {cartItems.length === 0 && <div style={{textAlign: 'center', padding: '20px', color: '#999'}}>Giỏ hàng trống</div>}
            </div>

            <div className="discount-section">
              <div className="discount-box">
                <Input placeholder="Mã giảm giá | Discount code" style={{ height: '40px' }} />
                <Button disabled style={{ height: '40px', background: '#ccc', color: '#fff', border: 'none' }}>Sử dụng | Use</Button>
              </div>
            </div>

            <div className="summary-fees">
              <div className="fee-row">
                <span>Tạm tính | Temporarily calculated</span>
                <span>{subtotal?.toLocaleString()}đ</span>
              </div>
              <div className="fee-row">
                <span>Phí vận chuyển | Shipping fee</span>
                <span>—</span>
              </div>
              <div className="fee-row total">
                <div className="total-label">
                  Tổng cộng | Total
                </div>
                <div className="total-amount">
                  <span style={{ marginRight: '5px', fontSize: '12px', color: '#666', fontWeight: 'normal' }}>VND</span> {total?.toLocaleString()}đ
                </div>
              </div>
            </div>
          </div>

          <div className="checkout-actions">
            <button className="btn-back-cart" onClick={() => navigate('/cart')}>
              <FaChevronLeft style={{ marginRight: '8px' }} /> Quay lại giỏ hàng
            </button>
            <button className="btn-complete" onClick={handleCompleteOrder}>
              Hoàn tất đơn hàng
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;
