import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../services/localStorageService';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';
import { getCartByUser, addCartItem, removeItem as removeCartItem } from '../../api/cart';
import { searchProducts } from '../../api/product';
import ProductCard from '../../components/ProductCard';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight, FaTimes, FaFileInvoice, FaCheck } from 'react-icons/fa';
import { message } from 'antd';

import './Cart.css';

// Reuse mapping from ProductDetail
const mapProductResponse = (p) => ({
  id: p.id,
  code: p.code,
  name: p.name,
  origin: p.supplierCode || 'N/A',
  price: p.discountPrice || p.price,
  oldPrice: p.discountPrice ? p.price : 0,
  discount: p.percent || 0,
  rating: p.avgRating || 0,
  ratingCount: p.reviewCount || 0,
  soldCount: p.soldQuantity || 0,
  inventoryQuantity: p.inventoryQuantity,
  isFlashSale: p.percent != null,
  image: p.images && p.images.length > 0 ? `${IMAGE_URL}/${p.images[0]}` : `${DEFAULT_IMAGE}`,
  hoverImage: p.images && p.images.length > 1 ? `${IMAGE_URL}/${p.images[1]}` : (p.images && p.images.length > 0 ? `${IMAGE_URL}/${p.images[0]}` : `${DEFAULT_IMAGE}`)
});

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [suggestedProducts, setSuggestedProducts] = useState([]);
  const [suggestedLoading, setSuggestedLoading] = useState(false);
  const [note, setNote] = useState('');

  const user = useSelector((state) => state.user);
  const token = getToken();
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const [suggestedPrev, setSuggestedPrev] = useState(null);
  const [suggestedNext, setSuggestedNext] = useState(null);

  // Load cart data
  const loadGuestCart = useCallback(async () => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
    const validatedItems = [];
    
    for (const item of guestCart.items) {
      try {
        const resp = await searchProducts({ code: item.productCode || item.code }, 1, 1);
        const latestInventory = resp?.data?.[0]?.inventoryQuantity ?? 0;
        
        if (item.quantity > latestInventory) {
          continue; // Xóa khỏi danh sách guest
        }
        
        validatedItems.push({
          id: item.productId,
          productId: item.productId,
          productCode: item.productCode || '',
          name: item.productName || item.name,
          price: item.discountPrice || item.price,
          originalPrice: item.discountPrice ? item.price : 0,
          quantity: item.quantity,
          image: item.images && item.images.length > 0 ? `${IMAGE_URL}/${item.images[0]}` : DEFAULT_IMAGE,
          inventoryQuantity: latestInventory,
          isGuest: true,
          unit: item.unit || 'Sản phẩm'
        });
      } catch (err) {
        console.error("Lỗi validate guest stock:", err);
      }
    }
    setCartItems(validatedItems);
    setLoading(false);
  }, []);

  const loadUserCart = useCallback(async () => {
    if (!user.id) return;
    try {
      setLoading(true);
      const result = await getCartByUser(user.id);
      const rawItems = result?.cartItems || result?.items || [];
      
      const validatedItems = [];
      for (const item of rawItems) {
        try {
          const resp = await searchProducts({ code: item.productCode || item.code }, 1, 1);
          const latestInventory = resp?.data?.[0]?.inventoryQuantity ?? 0;
          
          if (item.quantity > latestInventory) {
            // Tự động xóa khỏi server
            await removeItem(user.id, item.productId || item.id);
            messageApi.info(`Sản phẩm ${item.productName || item.name} đã bị xóa do hết hàng`);
            continue;
          }
          
          validatedItems.push({
            id: item.productId || item.id,
            productId: item.productId || item.id,
            productCode: item.productCode || item.code || '',
            name: item.productName || item.name,
            price: item.discountPrice || item.price,
            originalPrice: item.discountPrice ? item.price : 0,
            quantity: item.quantity,
            image: item.images && item.images.length > 0 ? `${IMAGE_URL}/${item.images[0]}` : DEFAULT_IMAGE,
            inventoryQuantity: latestInventory,
            isGuest: false,
            unit: item.unit || 'Sản phẩm'
          });
        } catch (err) {
          console.error("Lỗi validate stock:", err);
        }
      }
      setCartItems(validatedItems);
    } catch (error) {
      console.error('Error loading user cart:', error);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  const refreshCart = useCallback(() => {
    if (token && user.id) {
      loadUserCart();
    } else {
      loadGuestCart();
    }
  }, [token, user.id, loadUserCart, loadGuestCart]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  useEffect(() => {
    const handleCartUpdated = () => refreshCart();
    window.addEventListener('cartUpdated', handleCartUpdated);
    return () => window.removeEventListener('cartUpdated', handleCartUpdated);
  }, [refreshCart]);

  // Handle quantity changes
  const updateQuantity = async (item, delta) => {
    const currentQty = Number(item.quantity) || 1;
    
    // Kiểm tra trực tiếp từ API Product khi nhấn nút +
    if (delta > 0) {
      try {
        const resp = await searchProducts({ code: item.productCode || item.code }, 1, 1);
        const latestInventory = resp?.data?.[0]?.inventoryQuantity ?? 999;
        
        if (currentQty >= latestInventory) {
          messageApi.warning(`Không đủ hàng trong kho!`);
          return;
        }
      } catch (err) {
        console.error("Lỗi kiểm tra kho:", err);
      }
    }

    const newQty = Math.max(1, currentQty + delta);
    if (newQty === currentQty) return; // Không đổi nếu đang ở mức tối thiểu

    if (item.isGuest) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
      const idx = guestCart.items.findIndex((i) => i.productId === item.productId);
      if (idx !== -1) {
        guestCart.items[idx].quantity = newQty;
        localStorage.setItem('guestCart', JSON.stringify(guestCart));
      }
      loadGuestCart();
    } else {
      try {
        const body = {
          userId: user.id,
          productId: item.productId,
          quantity: 1, // Để pass validation @Min(1)
        };

        if (delta > 0) {
          body.updatedQuantity = 1; // Backend: qty = existing + updatedQuantity
        } else {
          body.deletedQuantity = 1; // Backend: qty = existing - deletedQuantity
        }

        await addCartItem(body);
        await loadUserCart();
      } catch (error) {
        messageApi.error('Cập nhật số lượng thất bại');
      }
    }
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = async (item) => {
    if (item.isGuest) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
      guestCart.items = guestCart.items.filter((i) => i.productId !== item.productId);
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      loadGuestCart();
    } else {
      try {
        await removeCartItem(user.id, item.productId);
        await loadUserCart();
      } catch (error) {
        messageApi.error('Xóa sản phẩm thất bại');
      }
    }
    window.dispatchEvent(new Event('cartUpdated'));
    messageApi.success('Đã xóa sản phẩm khỏi giỏ hàng');
  };

  // Fetch suggested products
  useEffect(() => {
    const fetchSuggested = async () => {
      setSuggestedLoading(true);
      try {
        const response = await searchProducts({ sortBy: 'soldQuantity', direction: 'DESC' }, 1, 18);
        if (response && response.data) {
          setSuggestedProducts(response.data.map(mapProductResponse));
        }
      } catch (error) {
        console.error("Error fetching suggestions:", error);
      } finally {
        setSuggestedLoading(false);
      }
    };
    fetchSuggested();
  }, []);

  const formatPrice = (price) => price.toLocaleString('vi-VN') + '₫';
  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  if (loading) {
    return <div className="cart-page" style={{ textAlign: 'center', padding: '100px 0' }}>Đang tải giỏ hàng...</div>;
  }

  return (
    <div className="cart-page">
      {contextHolder}
      {/* Breadcrumb */}
      <nav className="cart-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="cart-bc-sep">/</span>
        <span className="cart-bc-current">Giỏ hàng ({totalCount})</span>
      </nav>

      <div className="cart-header-row">
        <h1 className="cart-title">Giỏ hàng của bạn</h1>
        <span className="cart-count-info">Bạn đang có <strong>{totalCount} sản phẩm</strong> trong giỏ hàng</span>
      </div>

      <div className="cart-main">
        {/* LEFT COLUMN */}
        <div className="cart-left-col">
          {cartItems.length === 0 ? (
            <div className="cart-empty-state">
              <p>Giỏ hàng của bạn chưa có sản phẩm nào.</p>
              <Link to="/" className="cart-btn-return">TIẾP TỤC MUA SẮM</Link>
            </div>
          ) : (
            <>
              <div className="cart-items-list">
                {cartItems.map((item) => (
                  <div key={item.id} className="cart-item-row">
                    <button className="cart-item-remove-btn" onClick={() => removeItem(item)}>
                       Xóa
                    </button>
                    <div className="cart-item-img-box">
                      <img src={item.image} alt={item.name} onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
                    </div>
                    <div className="cart-item-info">
                      <Link to={`/products/${item.productCode}`} className="cart-item-name">{item.name}</Link>
                      <div className="cart-item-meta">{item.unit || 'Sản phẩm'}</div>
                      <div className="cart-item-price-each">{formatPrice(item.price)}</div>
                    </div>
                    <div className="cart-item-right">
                       <div className="cart-item-price-total">{formatPrice(item.price * item.quantity)}</div>
                       <div className="cart-item-qty">
                         <button onClick={() => updateQuantity(item, -1)}>−</button>
                         <span>{item.quantity}</span>
                         <button onClick={() => updateQuantity(item, 1)}>+</button>
                       </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="cart-note-section">
                <label className="cart-note-label">Ghi chú đơn hàng</label>
                <textarea 
                  className="cart-note-input"
                  // placeholder="Ghi chú về đơn hàng, ví dụ: thời gian giao hàng, địa chỉ chi tiết..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                ></textarea>
              </div>

              {/* Suggestions */}
              <section className="cart-suggestions">
                <div className="cart-suggestions-header">
                  <h2 className="cart-suggestions-title">Có thể bạn sẽ thích</h2>
                  {/* <Link to="/collections/all" className="cart-see-more">Xem thêm</Link> */}
                </div>
                {suggestedLoading ? (
                  <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>
                ) : (
                  <div className="cart-slider-container">
                    <Swiper
                      modules={[Navigation]}
                      spaceBetween={8}
                      slidesPerView={4}
                      navigation={{ prevEl: suggestedPrev, nextEl: suggestedNext }}
                      onBeforeInit={(swiper) => {
                        swiper.params.navigation.prevEl = suggestedPrev;
                        swiper.params.navigation.nextEl = suggestedNext;
                      }}
                      breakpoints={{
                        320: { slidesPerView: 2 },
                        640: { slidesPerView: 3 },
                        1024: { slidesPerView: 4 },
                      }}
                    >
                      {suggestedProducts.map((p) => (
                        <SwiperSlide key={p.id}>
                          <ProductCard product={p} />
                        </SwiperSlide>
                      ))}
                    </Swiper>
                    <div ref={(node) => setSuggestedPrev(node)} className="cart-nav cart-nav--prev"><FaChevronLeft /></div>
                    <div ref={(node) => setSuggestedNext(node)} className="cart-nav cart-nav--next"><FaChevronRight /></div>
                  </div>
                )}
              </section>
            </>
          )}
        </div>

        {/* RIGHT COLUMN */}
        <div className="cart-right-col">
          <div className="cart-sidebar-box cart-summary-box">
             <h3 className="cart-sidebar-title">Thông tin đơn hàng</h3>
             <div className="cart-summary-row cart-summary-total">
               <span>Tổng tiền:</span>
               <span className="cart-total-price">{formatPrice(totalPrice)}</span>
             </div>
             <p className="cart-summary-note">* Phí vận chuyển sẽ được tính ở trang thanh toán.</p>
             <button className="cart-btn-checkout" onClick={() => navigate('/checkout', { state: { note } })}>
               THANH TOÁN
             </button>
          </div>

          <div className="cart-sidebar-box cart-promo-box">
             <div className="cart-promo-header">
                <h3 className="cart-sidebar-title">Khuyến mãi dành cho bạn</h3>
                <div className="cart-promo-nav">
                   <button className="promo-nav-btn"><FaChevronLeft size={14} /></button>
                   <button className="promo-nav-btn"><FaChevronRight size={14} /></button>
                </div>
             </div>
             <div className="cart-promo-list">
                <div className="cart-promo-item">
                   <div className="promo-icon-box">
                      <div className="promo-free-ship-tag">FREE SHIP</div>
                      <img src="https://img.icons8.com/color/48/000000/free-shipping.png" alt="free-ship" />
                   </div>
                   <div className="promo-info">
                      <div className="promo-name">Miễn phí vận chuyển</div>
                      <div className="promo-desc">Đơn hàng từ 599K, giảm tối đa 20K</div>
                      <div className="promo-meta">
                         <div className="promo-meta-right">
                          <div className="promo-meta-left">
                            <span>Mã: <strong>FREESHIP20K2026T4</strong></span>
                            <span>HSD: 30/06/2026</span>
                          </div>
                          <button className="promo-copy-btn" onClick={() => {
                            navigator.clipboard.writeText('FREESHIP20K2026T4');
                            // message.success('Đã sao chép mã khuyến mãi');
                          }}>SAO CHÉP MÃ</button>
                         </div>
                      </div>
                   </div>
                   <div className="promo-info-icon">i</div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
