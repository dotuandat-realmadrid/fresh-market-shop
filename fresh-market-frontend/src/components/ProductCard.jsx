import React from 'react';
import { FaStar, FaRegHeart, FaHeart } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import './ProductCard.css';

const ProductCard = ({ product }) => {
  const [isFavorite, setIsFavorite] = React.useState(false);

  const renderStars = (rating) => {
    return (
      <div className="product-rating">
        {[...Array(5)].map((_, i) => (
          <FaStar key={i} className={i < rating ? 'star-filled' : 'star-empty'} />
        ))}
        <span className="rating-count">{product.ratingCount} đánh giá</span>
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
          <img src={product.image} alt={product.name} className="main-image" />
          <img src={product.hoverImage || product.image} alt={product.name} className="hover-image" />
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
          <span className="sold-count">Đã bán: {product.soldCount}</span>
          <div className="product-actions">
            <button 
              className={`wishlist-btn ${isFavorite ? 'active' : ''}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setIsFavorite(!isFavorite);
              }}
            >
              {isFavorite ? <FaHeart /> : <FaRegHeart />}
            </button>
            <button 
              className="add-to-cart-btn"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                // Thêm logic giỏ hàng ở đây nếu cần
              }}
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
