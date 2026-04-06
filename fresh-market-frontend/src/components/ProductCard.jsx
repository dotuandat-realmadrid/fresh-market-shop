import React from 'react';
import { FaStar, FaRegStar, FaStarHalfAlt, FaRegHeart, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { debounce } from 'lodash';
import './ProductCard.css';

import { IMAGE_URL, DEFAULT_IMAGE } from '../api/auth';
import { addCartItem } from '../api/cart';
import { getWishListByUser, toggleWishlist } from '../api/wishList';
import { getToken } from '../services/localStorageService';

const ProductCard = ({ product }) => {
  const userId = useSelector((state) => state.user.id);
  const [isFavorite, setIsFavorite] = React.useState(false);
  const [wishlistInited, setWishlistInited] = React.useState(false);


  const displayImage = product.image ||
    (product.images && product.images.length > 0 ? `${IMAGE_URL}/${product.images[0]}` : DEFAULT_IMAGE);

  const hoverImage = product.hoverImage ||
    (product.images && product.images.length > 1 ? `${IMAGE_URL}/${product.images[1]}` : displayImage);

  // Khởi tạo trạng thái wishlist
  React.useEffect(() => {
    if (wishlistInited) return;
    if (getToken() && userId) {
      // Đọc từ cache nếu có (tránh gọi API liên tục cho mỗi card)
      const cached = window.__wishlistCache;
      if (cached) {
        setIsFavorite(!!cached[product.id]);
        setWishlistInited(true);
      } else {
        getWishListByUser(userId, 1, 200).then((response) => {
          if (response && response.data) {
            const map = {};
            response.data.forEach((item) => { map[item.id] = true; });
            window.__wishlistCache = map;
            setIsFavorite(!!map[product.id]);
          }
          setWishlistInited(true);
        }).catch(() => setWishlistInited(true));
      }
    } else {
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || {};
      setIsFavorite(!!guestWishlist[product.id]);
      setWishlistInited(true);
    }
  }, [userId, product.id, wishlistInited]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newFav = !isFavorite;
    setIsFavorite(newFav);

    if (getToken() && userId) {
      try {
        await toggleWishlist(userId, product.id);
        // Cập nhật cache
        if (window.__wishlistCache) {
          if (newFav) window.__wishlistCache[product.id] = true;
          else delete window.__wishlistCache[product.id];
        }
        window.dispatchEvent(new Event('wishlistUpdated'));
        newFav
          ? message.success('Đã thêm vào danh sách yêu thích')
          : message.error('Đã xóa khỏi danh sách yêu thích');
      } catch {
        setIsFavorite(!newFav); // Hoàn lại nếu lỗi
        message.error('Có lỗi xảy ra, vui lòng thử lại!');
      }
    } else {
      const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || {};
      if (newFav) guestWishlist[product.id] = product;
      else delete guestWishlist[product.id];
      localStorage.setItem('guestWishlist', JSON.stringify(guestWishlist));
      window.dispatchEvent(new Event('wishlistUpdated'));
      newFav
        ? message.success('Đã thêm vào danh sách yêu thích')
        : message.error('Đã xóa khỏi danh sách yêu thích');
    }
  };

  const onAddToCartLogic = debounce(async (p, uid) => {
    if (!getToken()) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
      const existingItem = guestCart.items.find((item) => item.productId === p.id);
      if (existingItem) {
        if (existingItem.quantity >= p.inventoryQuantity) {
          message.warning(`Bạn đã chọn tối đa số lượng có trong kho (${p.inventoryQuantity})`);
          return;
        }
        existingItem.quantity += 1;
      } else {
        guestCart.items.push({
          productId: p.id,
          productCode: p.code,
          productName: p.name,
          price: p.price,
          discountPrice: p.discountPrice || null,
          images: p.images || [],
          quantity: 1,
          inventoryQuantity: p.inventoryQuantity,
        });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      window.dispatchEvent(new Event('cartUpdated'));
      message.success('Đã thêm vào giỏ hàng');
      return;
    }

    try {
      const data = {
        userId: uid,
        productId: p.id,
        quantity: 1,
        updatedQuantity: 1,
      };
      await addCartItem(data);
      window.dispatchEvent(new Event('cartUpdated'));
      message.success('Đã thêm vào giỏ hàng');
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  }, 500);

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Kiểm tra tồn kho
    if (product.inventoryQuantity !== undefined && product.inventoryQuantity <= 0) {
      message.warning('Sản phẩm đã hết hàng!');
      return;
    }

    onAddToCartLogic(product, userId);
  };

  const renderStars = (rating = 0) => {
    const safeRating = (typeof rating === 'number' && !isNaN(rating)) ? Math.max(0, Math.min(5, rating)) : 0;
    const fullStars = Math.floor(safeRating);
    const decimal = safeRating - fullStars;
    const hasHalf = decimal >= 0.5;
    const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

    return (
      <div className="product-rating">
        {[...Array(fullStars)].map((_, i) => (
          <FaStar key={`full-${i}`} className="star-filled" />
        ))}
        {hasHalf && (
          <FaStarHalfAlt key="half" className="star-filled" />
        )}
        {[...Array(emptyStars)].map((_, i) => (
          <FaRegStar key={`empty-${i}`} className="star-empty" />
        ))}
        <span className="rating-count">{product.ratingCount || 0} đánh giá</span>
      </div>
    );
  };

  return (
    <Link to={`/products/${product.code}`} className="product-card-container">

      <div className="product-card">
        <div className="product-badges">
          {product.discount > 0 && <span className="discount-badge">-{product.discount}%</span>}
          {product.isFlashSale && (
            <div className="flash-sale-badge">
              <span className="flash-text">FLASH</span>
              <span className="sale-text">SALE</span>
              <span className="lightning">⚡</span>
            </div>
          )}
        </div>

        <div className="product-image">
          <img src={displayImage} alt={product.name} className="main-image" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
          <img src={hoverImage || displayImage} alt={product.name} className="hover-image" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
        </div>

        <div className="product-info">
          <span className="product-origin">{product.origin}</span>
          <h3 className="product-name">{product.name}</h3>

          <div className="product-price">
            <span className="current-price">{product.price.toLocaleString()}₫</span>
            {product.oldPrice > product.price && (
              <span className="old-price">{product.oldPrice.toLocaleString()}₫</span>
            )}
          </div>

          {renderStars(product.rating)}

          <div className="product-footer">
            <div className="product-sold">
              <span className="sold-count">Đã bán: {product.soldCount}</span>
              {/* <span className="inventory-count">Còn lại: {product.inventoryQuantity}</span> */}
            </div>
            <div className="product-actions">
              <button
                className={`wishlist-btn ${isFavorite ? 'active' : ''}`}
                onClick={handleToggleWishlist}
                title={isFavorite ? 'Xóa khỏi yêu thích' : 'Thêm vào yêu thích'}
              >
                {isFavorite ? <FaHeart /> : <FaRegHeart />}
              </button>
              <button
                className="add-to-cart-btn"
                onClick={handleAddToCart}
              >
                <span className="btn-text">THÊM VÀO GIỎ</span>
                <div className="product-card-cart-icon">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                    <line x1="3" y1="6" x2="21" y2="6"></line>
                    <path d="M16 10a4 4 0 0 1-8 0"></path>
                  </svg>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
