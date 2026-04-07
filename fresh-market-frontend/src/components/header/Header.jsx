import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Dropdown, Select, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { getToken } from '../../services/localStorageService';
import { introspect, logout, login, IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';
import { addCartItem, getCartByUser, removeItem as removeCartItem } from '../../api/cart';
import { getWishListByUser, toggleWishlist } from '../../api/wishList';
import { searchProducts } from '../../api/product';
import icons from "../../assets/images/icon-1.png";
import './Header.css';

const Header = ({ onMenuToggle }) => {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [wishlistCount, setWishlistCount] = useState(0);
  const [cartLoading, setCartLoading] = useState(false);
  const cartRef = useRef(null);
  const loginRef = useRef(null);

  const [isLogin, setIsLogin] = useState(false);
  const user = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const token = getToken();
  const navigate = useNavigate();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // ===== Search Dropdown =====
  const [searchProductsList, setSearchProductsList] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const debounce = (func, wait) => {
    let timeout;
    const debounced = (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
  };

  const fetchProductsForSearch = async (search = "") => {
    if (!search.trim()) {
      setSearchProductsList([]);
      return;
    }
    setIsSearching(true);
    try {
      const data = await searchProducts({ name: search }, 1, 10);
      setSearchProductsList(data.data || []);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm tìm kiếm:", error);
    }
    setIsSearching(false);
  };

  const debouncedSearch = useMemo(
    () => debounce((value) => fetchProductsForSearch(value), 300),
    []
  );

  const onSearchQueryChange = (value) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const onSelectProduct = (productCode) => {
    setIsCartOpen(false); // Đóng cart nếu đang mở
    navigate(`/products/${productCode}`);
    setSearchValue('');
  };

  const handleSearchSubmit = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (searchValue && searchValue.trim()) {
      const trimmedQuery = searchValue.trim();
      // Kiểm tra nếu có sản phẩm nào khớp chính xác tên (không phân biệt hoa thường)
      const exactMatch = searchProductsList.find(
        (p) => p.name.toLowerCase() === trimmedQuery.toLowerCase()
      );

      if (exactMatch) {
        navigate(`/products/${exactMatch.code}`);
      } else {
        navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
      }
      
      setSearchValue('');
      setSearchProductsList([]); // Đóng danh sách gợi ý sau khi tìm kiếm
      setIsCartOpen(false);      // Đảm bảo các overlay đều đóng
    }
  };

  // ===== Cart helpers =====

  const loadGuestCart = useCallback(async () => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
    const validatedItems = [];
    
    for (const item of guestCart.items) {
      try {
        const resp = await searchProducts({ code: item.productCode || item.code }, 1, 1);
        const latestInventory = resp?.data?.[0]?.inventoryQuantity ?? 0;
        
        if (item.quantity > latestInventory) {
          continue; // Bỏ qua sản phẩm hết hàng
        }
        
        validatedItems.push({
          id: item.productId,
          productId: item.productId,
          name: item.productName,
          price: item.discountPrice || item.price,
          originalPrice: item.discountPrice ? item.price : 0,
          quantity: item.quantity,
          image: item.images && item.images.length > 0 ? `${IMAGE_URL}/${item.images[0]}` : DEFAULT_IMAGE,
          inventoryQuantity: latestInventory,
          isGuest: true,
        });
      } catch (err) {
        console.error("Lỗi validate guest stock:", err);
      }
    }
    setCartItems(validatedItems);
  }, []);

  const loadUserCart = useCallback(async () => {
    if (!user.id) return;
    try {
      setCartLoading(true);
      const result = await getCartByUser(user.id);
      const rawItems = result?.cartItems || result?.items || [];
      
      const validatedItems = [];
      for (const item of rawItems) {
        try {
          const resp = await searchProducts({ code: item.productCode || item.code }, 1, 1);
          const latestInventory = resp?.data?.[0]?.inventoryQuantity ?? 0;
          
          if (item.quantity > latestInventory) {
            // Tự động xóa khỏi server
            await removeCartItem(user.id, item.productId || item.id);
            message.info(`Sản phẩm ${item.productName || item.name} đã bị xóa do hết hàng`);
            continue; // Không thêm vào danh sách hiển thị
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
          });
        } catch (err) {
          console.error("Lỗi validate stock:", err);
        }
      }
      setCartItems(validatedItems);
    } catch (error) {
      console.error('Error loading user cart:', error);
    } finally {
      setCartLoading(false);
    }
  }, [user.id]);

  const refreshCart = useCallback(() => {
    if (token && user.id) {
      loadUserCart();
    } else {
      loadGuestCart();
    }
  }, [token, user.id, loadUserCart, loadGuestCart]);

  // ===== Wishlist count =====

  const loadWishlistCount = useCallback(async () => {
    if (token && user.id) {
      try {
        const result = await getWishListByUser(user.id, 1, 200);
        if (result && result.data) {
          setWishlistCount(result.data.length);
          // Lưu cache cho ProductCard
          const map = {};
          result.data.forEach((item) => { map[item.id] = true; });
          window.__wishlistCache = map;
        }
      } catch {
        setWishlistCount(0);
      }
    } else {
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || {};
      setWishlistCount(Object.keys(guestWishlist).length);
    }
  }, [token, user.id]);

  // ===== Token validation =====

  useEffect(() => {
    const isValidToken = async () => {
      try {
        const isValid = await introspect(token);
        setIsLogin(isValid);
      } catch {
        setIsLogin(false);
      }
    };
    if (token) {
      isValidToken();
    } else {
      setIsLogin(false);
    }
  }, [token]);

  // ===== Load cart & wishlist on auth change =====

  useEffect(() => {
    refreshCart();
    loadWishlistCount();
  }, [token, user.id]);

  useEffect(() => {
    const handleCartUpdated = () => refreshCart();
    window.addEventListener('cartUpdated', handleCartUpdated);
    return () => window.removeEventListener('cartUpdated', handleCartUpdated);
  }, [refreshCart]);

  useEffect(() => {
    const handleWishlistUpdated = () => loadWishlistCount();
    window.addEventListener('wishlistUpdated', handleWishlistUpdated);
    return () => window.removeEventListener('wishlistUpdated', handleWishlistUpdated);
  }, [loadWishlistCount]);

  // ===== Cart sidebar close on outside click =====

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (cartRef.current && !cartRef.current.contains(e.target)) {
        setIsCartOpen(false);
      }
    };
    if (isCartOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isCartOpen]);

  // ===== Login dropdown close =====

  useEffect(() => {
    const handleCloseLogin = (e) => {
      if (loginRef.current && !loginRef.current.contains(e.target)) {
        setIsLoginOpen(false);
      }
    };
    const handleScroll = () => {
      if (isLoginOpen && loginRef.current) {
        const rect = loginRef.current.getBoundingClientRect();
        if (rect.bottom < 0 || rect.top > window.innerHeight) {
          setIsLoginOpen(false);
        }
      }
    };
    if (isLoginOpen) {
      document.addEventListener('mousedown', handleCloseLogin);
      window.addEventListener('scroll', handleScroll);
    }
    return () => {
      document.removeEventListener('mousedown', handleCloseLogin);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [isLoginOpen]);

  // ===== Cart actions =====

  const totalPrice = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const updateGuestCartQuantity = (productId, newQty) => {
    const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
    const idx = guestCart.items.findIndex((i) => i.productId === productId);
    if (idx !== -1) {
      guestCart.items[idx].quantity = newQty;
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
    }
    loadGuestCart();
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const updateQuantity = async (item, delta) => {
    const currentQty = Number(item.quantity) || 1;
    
    // Nếu tăng số lượng, hãy kiểm tra tồn kho mới nhất từ API
    if (delta > 0) {
      try {
        const resp = await searchProducts({ code: item.productCode || item.code }, 1, 1);
        const latestInventory = resp?.data?.[0]?.inventoryQuantity ?? 999;
        
        if (currentQty >= latestInventory) {
          if (typeof message !== 'undefined') {
            message.warning(`Không thể tăng thêm (Tồn kho hiện tại: ${latestInventory})`);
          }
          return;
        }
      } catch (err) {
        console.error("Lỗi kiểm tra tồn kho:", err);
      }
    }

    const newQty = Math.max(1, currentQty + delta);
    if (newQty === currentQty) return; // Không đổi nếu đang ở mức tối thiểu

    if (item.isGuest) {
      updateGuestCartQuantity(item.productId, newQty);
    } else {
      // Gọi API cập nhật
      try {
        const body = {
          userId: user.id,
          productId: item.productId,
          quantity: 1, // Luôn gửi 1 để pass validation @Min(1)
        };

        if (delta > 0) {
          body.updatedQuantity = 1; // Backend: quantity = existing + updatedQuantity
        } else {
          body.deletedQuantity = 1; // Backend: quantity = existing - deletedQuantity
        }

        await addCartItem(body);
        await loadUserCart();
        window.dispatchEvent(new Event('cartUpdated'));
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    }
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
        console.error('Error removing cart item:', error);
      }
    }
    window.dispatchEvent(new Event('cartUpdated'));
  };

  // ===== Auth actions =====

  const handleLogout = () => {
    setIsLogin(false);
    dispatch(logout());
    window.__wishlistCache = null;
    // Cập nhật lại giỏ hàng guest sau khi đăng xuất
    setTimeout(() => {
      loadGuestCart();
      setWishlistCount(Object.keys(JSON.parse(localStorage.getItem('guestWishlist')) || {}).length);
    }, 100);
  };

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    login(
      { username: loginEmail, password: loginPassword },
      navigate,
      dispatch
    ).then(() => {
      setIsLoginOpen(false);
    });
  };



  const formatPrice = (price) => price.toLocaleString('vi-VN') + '₫';

  return (
    <>
      <header className="header-container bg-white border-bottom py-4">
        <div className="container-fluid px-4 px-lg-5">
          <div className="row align-items-center">
            {/* Logo Section */}
            <div className="col-12 col-md-4 col-lg-2 header-logo mb-3 mb-lg-0 d-flex align-items-center justify-content-between justify-content-lg-start">
              <div className="d-lg-none menu-toggle-btn cursor-pointer" onClick={onMenuToggle}>
                <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="3" y1="12" x2="21" y2="12"></line>
                  <line x1="3" y1="6" x2="21" y2="6"></line>
                  <line x1="3" y1="18" x2="21" y2="18"></line>
                </svg>
              </div>
              <Link to="/" className="text-decoration-none d-flex align-items-center gap-2">
                <img src={icons} alt="Fresh Market Icon" style={{ height: '40px', objectFit: 'contain' }} />
                <div className="d-flex flex-column" style={{ lineHeight: '1.1' }}>
                  <span className="fw-900" style={{ color: '#004aad', fontSize: '24px', fontWeight: '900', letterSpacing: '0.5px' }}>BICH THUY</span>
                  <span className="fw-bold" style={{ color: '#ff6600', fontSize: '15px', letterSpacing: '2px', paddingLeft: '2px' }}>MARKET</span>
                </div>
              </Link>
              <div className="d-lg-none invisible">
                <svg width="28" height="28"></svg>
              </div>
            </div>

            {/* Search Bar Section */}
            <div className="col-12 col-md-8 col-lg-5 header-search px-3 px-lg-5 mb-3 mb-lg-0">
              <div className="search-form d-flex w-100">
                <button type="button" className="search-btn bg-transparent border-0 px-3 text-secondary" onClick={handleSearchSubmit}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="11" cy="11" r="8"></circle>
                    <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                  </svg>
                </button>
                <div style={{ flex: 1, position: 'relative' }}>
                  <Select
                    showSearch
                    value={searchValue || undefined}
                    placeholder="Tìm kiếm sản phẩm..."
                    className="search-input-select w-100 h-100"
                    variant="borderless"
                    filterOption={false}
                    defaultActiveFirstOption={false} // Không tự động highlight bản ghi đầu tiên
                    onSearch={onSearchQueryChange}
                    onSelect={(val, option) => onSelectProduct(option.code)}
                    onInputKeyDown={(e) => {
                      if (e.key === 'Enter' && !isSearching) {
                        handleSearchSubmit();
                      }
                    }}
                    notFoundContent={isSearching ? <div style={{ textAlign: 'center', padding: '10px' }}><Spin size="small" /></div> : null}
                    classNames={{ popup: { root: 'search-dropdown-popup' } }}
                  >
                    {searchProductsList.map((product) => (
                        <Select.Option key={product.code} value={product.name} code={product.code}>
                          <div className="d-flex align-items-center gap-2">
                            <img 
                              src={product.images && product.images.length > 0 ? `${IMAGE_URL}/${product.images[0]}` : DEFAULT_IMAGE} 
                              alt={product.name} 
                              style={{ width: '32px', height: '32px', objectFit: 'cover', borderRadius: '4px' }}
                            />
                            <div className="d-flex flex-column" style={{ lineHeight: '1.2' }}>
                              <span style={{ fontSize: '13px', fontWeight: 500 }}>{product.name}</span>
                              <span style={{ fontSize: '12px', color: '#888' }}>{product.price.toLocaleString('vi-VN')}₫</span>
                            </div>
                          </div>
                        </Select.Option>
                    ))}
                  </Select>
                </div>
              </div>
            </div>

            {/* User and Cart Actions Section */}
            <div className="col-12 col-lg-5 header-actions d-flex flex-wrap align-items-center justify-content-center justify-content-lg-end gap-3 gap-lg-4">
              {/* Favorites */}
              <Link to="/collections/wish-list" className="text-decoration-none">
                <div className="header-favorite d-flex align-items-center gap-2 cursor-pointer">
                  <div className="cart-icon-wrapper position-relative text-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                    <span className="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                      {wishlistCount > 99 ? '99+' : wishlistCount}
                    </span>
                  </div>
                  <span className="cart-text mb-0">Sản phẩm<br />yêu thích</span>
                </div>
              </Link>

              {/* Cart */}
              <div
                className="header-cart d-flex align-items-center gap-2 cursor-pointer"
                onClick={() => {
                  refreshCart();
                  setIsCartOpen(true);
                }}
              >
                <div className="cart-icon-wrapper position-relative text-dark">
                  <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                  <span className="cart-badge position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                    {totalCount > 99 ? '99+' : totalCount}
                  </span>
                </div>
                <span className="cart-text mb-0">Giỏ hàng</span>
              </div>

              {/* User Account */}
              {isLogin ? (
                <Dropdown
                  menu={{
                    items: [
                      {
                        key: 'user-info',
                        label: (
                          <div style={{ padding: '8px 12px', minWidth: '220px' }}>
                            <div style={{ fontSize: '15px', color: '#666', fontWeight: 500, textTransform: 'uppercase', marginBottom: '8px', textAlign: 'center' }}>Thông tin tài khoản</div>
                            <hr style={{ margin: '8px 0', borderTop: '1px solid #eaeaea' }} />
                            <div style={{ fontSize: '16px', fontWeight: 500, color: '#333', marginBottom: '16px' }}>{user.fullName || user.username}</div>
                            <div className="d-flex flex-column gap-3 mb-2">
                              {user.roles && user.roles.some((role) => role !== 'CUSTOMER') && (
                                <Link to="/admin" className="text-decoration-none text-dark d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                                  <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: '#333', borderRadius: '50%' }}></span>
                                  Quản trị viên
                                </Link>
                              )}
                              <Link to="/my-profile" className="text-decoration-none text-dark d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                                <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: '#333', borderRadius: '50%' }}></span>
                                Tài khoản của tôi
                              </Link>
                              <Link to="/my-address" className="text-decoration-none text-dark d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                                <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: '#333', borderRadius: '50%' }}></span>
                                Danh sách địa chỉ
                              </Link>
                              <Link to="/my-orders" className="text-decoration-none text-dark d-flex align-items-center gap-2" style={{ fontSize: '15px' }}>
                                <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: '#333', borderRadius: '50%' }}></span>
                                Đơn hàng của tôi
                              </Link>
                              <div onClick={handleLogout} className="text-decoration-none text-dark d-flex align-items-center gap-2" style={{ fontSize: '15px', cursor: 'pointer' }}>
                                <span style={{ display: 'inline-block', width: '5px', height: '5px', backgroundColor: '#333', borderRadius: '50%' }}></span>
                                Đăng xuất
                              </div>
                            </div>
                          </div>
                        ),
                      },
                    ],
                  }}
                  trigger={['hover']}
                  placement="bottomRight"
                >
                  <div className="header-user d-flex align-items-center gap-2 cursor-pointer position-relative">
                    <div className="user-icon text-dark">
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                        <circle cx="12" cy="7" r="4"></circle>
                      </svg>
                    </div>
                    <div className="user-info d-flex flex-column text-start">
                      <span className="user-login">Tài khoản của</span>
                      <span className="user-account d-flex align-items-center gap-1" style={{ fontWeight: 500 }}>
                        {user.fullName ? user.fullName.split(' ').slice(-2).join(' ') : 'Bạn'}
                        <svg className="chevron-down mt-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="6 9 12 15 18 9"></polyline>
                        </svg>
                      </span>
                    </div>
                  </div>
                </Dropdown>
              ) : (
                <div
                  ref={loginRef}
                  className="header-user d-flex align-items-center gap-2 cursor-pointer position-relative"
                  onClick={() => setIsLoginOpen(!isLoginOpen)}
                >
                  <div className="user-icon text-dark">
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  </div>
                  <div className="user-info d-flex flex-column text-start">
                    <span className="user-login">Đăng nhập / Đăng ký</span>
                    <span className="user-account d-flex align-items-center gap-1">
                      Tài khoản của tôi
                      <svg className="chevron-down mt-1" xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="6 9 12 15 18 9"></polyline>
                      </svg>
                    </span>
                  </div>

                  {/* Login Dropdown */}
                  {isLoginOpen && (
                    <div className="login-dropdown shadow rounded bg-white p-4 position-absolute text-start z-3" onClick={(e) => e.stopPropagation()}>
                      <h6 className="text-center mb-1" style={{ fontSize: '18px', fontWeight: '500', color: '#333' }}>ĐĂNG NHẬP TÀI KHOẢN</h6>
                      <p className="text-center text-muted mb-4" style={{ fontSize: '14px' }}>Nhập email và mật khẩu của bạn:</p>

                      <form onSubmit={handleLoginSubmit}>
                        <div className="mb-3 border rounded px-3 py-1">
                          <input
                            type="email"
                            className="form-control border-0 p-0 shadow-none bg-transparent"
                            placeholder="Email"
                            value={loginEmail}
                            onChange={(e) => setLoginEmail(e.target.value)}
                            autoComplete="username"
                            required
                          />
                        </div>
                        <div className="mb-3 border rounded px-3 py-1 d-flex align-items-center justify-content-between">
                          <input
                            type={showPassword ? 'text' : 'password'}
                            className="form-control border-0 p-0 shadow-none bg-transparent"
                            placeholder="Mật khẩu"
                            value={loginPassword}
                            onChange={(e) => setLoginPassword(e.target.value)}
                            autoComplete="current-password"
                            required
                          />
                          <div className="cursor-pointer text-muted px-1" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                <line x1="1" y1="1" x2="23" y2="23"></line>
                              </svg>
                            ) : (
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                            )}
                          </div>
                        </div>
                        <p className="small text-muted mb-4" style={{ fontSize: '13px', lineHeight: '1.4' }}>
                          This site is protected by reCAPTCHA and the Google <a href="#" className="text-primary text-decoration-none">Privacy Policy</a> and <a href="#" className="text-primary text-decoration-none">Terms of Service</a> apply.
                        </p>
                        <button type="submit" className="btn w-100 py-2 mb-4 font-weight-bold" style={{ backgroundColor: '#111', color: '#fff', borderRadius: '4px', fontSize: '14px', letterSpacing: '0.5px' }}>
                          ĐĂNG NHẬP
                        </button>
                      </form>

                      <div className="d-flex flex-column gap-2" style={{ fontSize: '14px' }}>
                        <div className="text-muted">Khách hàng mới? <Link to="/register" className="text-primary text-decoration-none" onClick={() => setIsLoginOpen(false)}>Tạo tài khoản</Link></div>
                        <div className="text-muted">Quên mật khẩu? <Link to="/forgot-password" className="text-primary text-decoration-none" onClick={() => setIsLoginOpen(false)}>Khôi phục mật khẩu</Link></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Cart Overlay */}
      {isCartOpen && (
        <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      )}

      {/* Cart Sidebar Panel */}
      <div className={`cart-sidebar ${isCartOpen ? 'cart-sidebar--open' : ''}`} ref={cartRef}>
        {/* Header */}
        <div className="cart-sidebar__header">
          <span className="cart-sidebar__title">Giỏ hàng ({totalCount})</span>
          <button className="cart-sidebar__close" onClick={() => setIsCartOpen(false)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Cart Items */}
        <div className="cart-sidebar__body">
          {cartLoading ? (
            <div className="cart-sidebar__empty">
              <div className="spinner-border text-secondary" role="status" style={{ width: '2rem', height: '2rem' }}>
                <span className="visually-hidden">Đang tải...</span>
              </div>
              <p>Đang tải giỏ hàng...</p>
            </div>
          ) : cartItems.length === 0 ? (
            <div className="cart-sidebar__empty">
              <svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                <line x1="3" y1="6" x2="21" y2="6"></line>
                <path d="M16 10a4 4 0 0 1-8 0"></path>
              </svg>
              <p>Giỏ hàng của bạn đang trống</p>

            </div>
          ) : (
            cartItems.map((item) => (
              <div key={item.productId || item.id} className="cart-item">
                <Link to={`/products/${item.productCode || ''}`} onClick={() => setIsCartOpen(false)}>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="cart-item__img"
                    onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
                  />
                </Link>
                <div className="cart-item__info">
                  <p className="cart-item__name">{item.name}</p>
                  <div className="cart-item__qty">
                    <button onClick={() => updateQuantity(item, -1)}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQuantity(item, 1)}>+</button>
                  </div>
                </div>
                <div className="cart-item__prices">
                  <span className="cart-item__price">{formatPrice(item.price)}</span>
                  {item.originalPrice > item.price && (
                    <span className="cart-item__original">{formatPrice(item.originalPrice)}</span>
                  )}
                </div>
                <button className="cart-item__remove" onClick={() => removeItem(item)}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {cartItems.length > 0 ? (
          <div className="cart-sidebar__footer">
            <div className="cart-sidebar__total">
              <span>TỔNG TIỀN:</span>
              <span className="cart-sidebar__total-price">{formatPrice(totalPrice)}</span>
            </div>
            <button className="cart-sidebar__btn cart-sidebar__btn--note"
              onClick={() => { setIsCartOpen(false); navigate('/cart'); }}
            >
              GHI CHÚ ĐƠN HÀNG - XUẤT HÓA ĐƠN VAT
            </button>
            <button
              className="cart-sidebar__btn cart-sidebar__btn--checkout"
              onClick={() => { setIsCartOpen(false); navigate('/checkout'); }}
            >
              THANH TOÁN
            </button>
            <div className="cart-sidebar__links">
              <Link to="/cart" className="cart-sidebar__link" onClick={() => setIsCartOpen(false)}>
                Xem giỏ hàng
              </Link>
            </div>
          </div>
        ) : !cartLoading && (
          <div className="cart-sidebar__footer">
            <Link to="/" className="cart-sidebar__btn cart-sidebar__btn--black" onClick={() => setIsCartOpen(false)}>
              Tiếp tục mua sắm
            </Link>
          </div>
        )}
      </div>
    </>
  );
};

export default Header;
