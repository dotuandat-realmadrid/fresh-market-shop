import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaStar, FaRegStar, FaChevronLeft, FaChevronRight, FaFacebookF, FaTwitter, FaPinterestP, FaLink, FaPlay, FaPause, FaSearch, FaThLarge, FaTimes, FaRegCommentDots, FaRegEdit } from 'react-icons/fa';
import { SiMessenger } from 'react-icons/si';
import ProductCard from '../../components/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './ProductDetail.css';

// ── Mock images (dùng ảnh có sẵn trong project) ──────────────────────────────
import productImg1 from '../../assets/images/menu2_icon_9.jpg';
import productImg2 from '../../assets/images/img_item_category_home_1_medium.png';
import productImg3 from '../../assets/images/img_item_category_home_3_medium.png';

// ── Service & Notice images ──────────────────────────────────────────────────
import hcmNotice from '../../assets/images/hcm2.jpg';
import serviceIcon1 from '../../assets/images/product_deliverly_1_ico.png';
import serviceIcon2 from '../../assets/images/product_deliverly_2_ico.png';
import serviceIcon3 from '../../assets/images/product_deliverly_3_ico.png';
import serviceIcon4 from '../../assets/images/product_deliverly_4_ico.png';

// ── Mock data ─────────────────────────────────────────────────────────────────
const product = {
  id: 1,
  name: 'Nho đen Nam Phi (Hộp 500G)',
  sku: 'I0026214',
  brand: 'Úc',
  status: 'Còn hàng',
  price: 89000,
  oldPrice: 169000,
  discount: 47,
  rating: 5.0,
  reviewCount: 2,
  soldCount: 1549,
  images: [productImg1, productImg2, productImg3],
  category: 'Trái Cây',
  description: `<p><strong>Nho đen Nam Phi</strong></p>
  <ul>
    <li><strong>- Xuất xứ:</strong> <span style="color:#1a73e8">Nam Phi</span></li>
    <li><strong>- Tiêu chuẩn chất lượng:</strong> <span style="color:#1a73e8">Nhập khẩu</span></li>
    <li><strong>- Quy cách:</strong>  hộp 500G</li>
    <li><strong>- Đặc điểm nổi bật:</strong></li>
  </ul>
  <ul style="padding-left:32px">
    <li style="color:#1a73e8">Thịt nho mềm, giòn, mọng nước, vị ngọt thanh mát, hấp dẫn.</li>
    <li style="color:#1a73e8">Đặc biệt, nho không hạt.</li>
  </ul>`,
  reviews: [
    {
      id: 1,
      user: 'Mr Bo Loi',
      avatar: 'M',
      avatarColor: '#fbc02d',
      rating: 5,
      date: '10 tháng trước',
      title: 'Sản phẩm Chất Lượng',
      comment: 'Hàng mới, giao hàng nhanh',
    },
    {
      id: 2,
      user: 'Phúc',
      avatar: 'P',
      avatarColor: '#fbc02d',
      rating: 5,
      date: '10 tháng trước',
      title: 'Dâu ngon, tươi',
      comment: 'hàng giao nhanh, tươi ngon lắm nhen shop. Sẽ ủng hộ nhiều nữa',
      isVerified: true,
      reply: {
        user: 'FARMERS MARKET',
        date: '10 tháng trước',
        comment: 'Cảm ơn quý khách đã tin tưởng và ủng hộ FARMERS MARKET ạ.'
      }
    }
  ]
};

const relatedProducts = Array.from({ length: 8 }, (_, i) => ({
  id: i + 10,
  name: ['Mận đỏ ruột vàng Croc Eggs Úc -...', 'Việt quất Mộc Châu 125 g', '[Combo 4 Hộp] Dâu Hàn Quốc...', 'Dâu Hàn Quốc Jumbo 330 g (8...', 'Cherry Đỏ Mỹ hộp 500g', 'Dưa lưới Thái Lan', 'Xoài Cát Chu', 'Bơ 034 Đắk Lắk'][i],
  origin: ['ÚC', 'VIỆT NAM', 'KHÁC', 'HÀN QUỐC', 'MỸ', 'THÁI LAN', 'VIỆT NAM', 'VIỆT NAM'][i],
  price: [174500, 129000, 636000, 299000, 189000, 89000, 45000, 55000][i],
  oldPrice: [0, 0, 796000, 0, 0, 0, 0, 0][i],
  discount: [0, 0, 20, 0, 0, 0, 0, 0][i],
  isFlashSale: i === 2,
  rating: 0,
  ratingCount: 0,
  soldCount: [1847, 1520, 1452, 1452, 1320, 980, 2100, 876][i],
  image: [productImg2, productImg3, productImg1, productImg2, productImg3, productImg1, productImg2, productImg3][i],
  hoverImage: productImg1,
}));

const recentlyViewed = Array.from({ length: 10 }, (_, i) => ({
  id: i + 20,
  name: ['Nho đen Nam Phi (Hộp 500G)', 'Tháp Trái Cây Các Loại Tiêu Chuẩn', 'Chậu Cây Lan Ý Tịnh Tâm Hoa', 'Giỏ Đan Trái Cây Các Loại Và Hoa Tone...'][i % 4],
  origin: ['ÚC', 'FARMERS MARKET', 'FARMERS MARKET', 'FARMERS MARKET'][i % 4],
  price: [89000, 1549000, 128000, 1259000][i % 4],
  oldPrice: [169000, 1759000, 0, 2169000][i % 4],
  discount: [47, 12, 0, 42][i % 4],
  isFlashSale: false,
  rating: 0,
  ratingCount: 0,
  soldCount: [1549, 1659, 1532, 1457][i % 4],
  image: [productImg1, productImg2, productImg3, productImg2][i % 4],
  hoverImage: productImg3,
}));

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (n) => n.toLocaleString('vi-VN') + '₫';

const StarRow = ({ rating, size = 14, className = "" }) => (
  <div className={`pd-star-row ${className}`}>
    {[1, 2, 3, 4, 5].map((s) =>
      s <= rating
        ? <FaStar key={s} size={size} className="star-filled" />
        : <FaRegStar key={s} size={size} className="star-empty" />
    )}
  </div>
);

const RatingBar = ({ stars, percentage, count }) => (
  <div className="pd-rating-bar-item">
    <StarRow rating={stars} size={14} className="pd-bar-stars" />
    <div className="pd-bar-track">
      <div className="pd-bar-fill" style={{ width: `${percentage}%` }}></div>
    </div>
    <span className="pd-bar-percent">{percentage.toFixed(1)}%</span>
    <span className="pd-bar-count">({count})</span>
  </div>
);

// ── Shared Product Slider Component ──────────────────────────────────────────
const ProductSlider = ({ products, slidesPerView, prevEl, setPrevEl, nextEl, setNextEl }) => {
  return (
    <div className="pd-slider-container">
      <Swiper
        modules={[Navigation]}
        spaceBetween={15}
        slidesPerView={slidesPerView}
        navigation={{ prevEl, nextEl }}
        onBeforeInit={(swiper) => {
          swiper.params.navigation.prevEl = prevEl;
          swiper.params.navigation.nextEl = nextEl;
        }}
        loop={products.length > slidesPerView}
        breakpoints={{
          320: { slidesPerView: 2 },
          640: { slidesPerView: 3 },
          1024: { slidesPerView: slidesPerView > 4 ? 4 : slidesPerView },
          1200: { slidesPerView: slidesPerView },
        }}
      >
        {products.map((p) => (
          <SwiperSlide key={p.id}>
            <ProductCard product={p} />
          </SwiperSlide>
        ))}
      </Swiper>
      <div ref={(node) => setPrevEl(node)} className="custom-nav pd-prev"><FaChevronLeft /></div>
      <div ref={(node) => setNextEl(node)} className="custom-nav pd-next"><FaChevronRight /></div>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────────
const ProductDetail = () => {
  const [qty, setQty] = useState(1);
  const [descExpanded, setDescExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState('review');

  // Navigation states for Swiper
  const [gallerySwiper, setGallerySwiper] = useState(null);
  const [galleryPrev, setGalleryPrev] = useState(null);
  const [galleryNext, setGalleryNext] = useState(null);
  const [activeThumb, setActiveThumb] = useState(0);
  const [relatedPrev, setRelatedPrev] = useState(null);
  const [relatedNext, setRelatedNext] = useState(null);
  const [recentPrev, setRecentPrev] = useState(null);
  const [recentNext, setRecentNext] = useState(null);

  // Review Form state
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [isQAFormOpen, setIsQAFormOpen] = useState(false);
  const [formRating, setFormRating] = useState(5);

  // Lightbox state
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lbIndex, setLbIndex] = useState(0);
  const [lbPlaying, setLbPlaying] = useState(false);

  // Lightbox 'Play' logic
  React.useEffect(() => {
    let interval;
    if (lbPlaying && isLightboxOpen) {
      interval = setInterval(() => {
        setLbIndex((prev) => {
          if (prev >= product.images.length - 1) {
            setLbPlaying(false); // Stop at the last image
            return 0; // Return to the first image
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [lbPlaying, isLightboxOpen]);

  const savings = product.oldPrice - product.price;

  return (
    <div className="pd-page">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="pd-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="pd-bc-sep">/</span>
        <Link to="/collections/trai-cay">{product.category}</Link>
        <span className="pd-bc-sep">/</span>
        <span className="pd-bc-current">{product.name}</span>
      </nav>

      {/* ── Two-column layout: Left 6fr | Right 4fr ──────────────────────── */}
      <div className="pd-main">

        {/* ══ LEFT COLUMN: gallery + share + related + description ══ */}
        <div className="pd-left-col">

          {/* Image Gallery */}
          <div className="pd-gallery-col">
            <div className="pd-gallery">
              <div className="pd-thumbnails">
                {product.images.map((img, i) => (
                  <div
                    key={i}
                    className={`pd-thumb ${activeThumb === i ? 'pd-thumb--active' : ''}`}
                    onClick={() => {
                        setActiveThumb(i);
                        if(gallerySwiper) gallerySwiper.slideToLoop(i);
                    }}
                  >
                    <img src={img} alt={`Ảnh ${i + 1}`} />
                  </div>
                ))}
              </div>

              <div className="pd-main-image-wrap">
                {product.discount > 0 && (
                  <div className="pd-discount-badge">
                    <span>-{product.discount}%</span>
                    <span>OFF</span>
                  </div>
                )}
                
                <div className="pd-gallery-swiper-container">
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation={{ prevEl: galleryPrev, nextEl: galleryNext }}
                    onSwiper={setGallerySwiper}
                    onSlideChange={(swiper) => setActiveThumb(swiper.realIndex)}
                    onBeforeInit={(swiper) => {
                      swiper.params.navigation.prevEl = galleryPrev;
                      swiper.params.navigation.nextEl = galleryNext;
                    }}
                    pagination={false} /* Removed 3 dots */
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={product.images.length > 1}
                  >
                    {product.images.map((img, i) => (
                      <SwiperSlide key={i}>
                        <img 
                          className="pd-main-image" 
                          src={img} 
                          alt={`${product.name} ${i + 1}`} 
                          onClick={() => {
                            setLbIndex(i);
                            setIsLightboxOpen(true);
                          }}
                        />
                      </SwiperSlide>
                    ))}
                  </Swiper>
                  
                  {/* Gallery Navigation Arrows */}
                  <div ref={(node) => setGalleryPrev(node)} className="custom-nav pd-gallery-prev"><FaChevronLeft /></div>
                  <div ref={(node) => setGalleryNext(node)} className="custom-nav pd-gallery-next"><FaChevronRight /></div>
                </div>
              </div>
            </div>

            {/* Share — dưới ảnh, căn giữa */}
            <div className="pd-share pd-share--center">
              <span className="pd-share-label">Chia sẻ:</span>
              <a href="#" className="pd-share-btn pd-share-btn--fb" title="Facebook"><FaFacebookF /></a>
              <a href="#" className="pd-share-btn pd-share-btn--msg" title="Messenger"><SiMessenger /></a>
              <a href="#" className="pd-share-btn pd-share-btn--tw" title="Twitter"><FaTwitter /></a>
              <a href="#" className="pd-share-btn pd-share-btn--pin" title="Pinterest"><FaPinterestP /></a>
              <a href="#" className="pd-share-btn pd-share-btn--link" title="Copy link"><FaLink /></a>
            </div>
          </div>

          {/* Related Products */}
          <section className="pd-section pd-section--left">
            <h2 className="pd-section-title">Sản phẩm liên quan</h2>
            <ProductSlider 
              products={relatedProducts} 
              slidesPerView={3} 
              prevEl={relatedPrev} 
              setPrevEl={setRelatedPrev} 
              nextEl={relatedNext} 
              setNextEl={setRelatedNext} 
            />
          </section>

          {/* Description */}
          <section className="pd-section pd-section--left">
            <h2 className="pd-desc-heading">MÔ TẢ SẢN PHẨM</h2>
            <div
              className={`pd-desc-body ${descExpanded ? 'pd-desc-body--expanded' : ''}`}
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
            <button className="pd-desc-toggle" onClick={() => setDescExpanded((v) => !v)}>
              {descExpanded ? '− Thu gọn' : '+ Xem thêm nội dung'}
            </button>
          </section>
        </div>

        {/* ══ RIGHT COLUMN: product info ══ */}
        <div className="pd-info pd-info--sticky">
          {/* Meta */}
          <div className="pd-meta">
            <span className="pd-meta-item">Thương hiệu: <strong>{product.brand}</strong></span>
            <span className="pd-meta-divider">|</span>
            <span className="pd-meta-item">Tình trạng: <strong className="pd-status--instock">{product.status}</strong></span>
          </div>

          <h1 className="pd-title">{product.name}</h1>
          <p className="pd-sku">Mã sản phẩm: <strong>{product.sku}</strong></p>

          {/* Delivery notice */}
          <div className="pd-delivery-notice">
            <img src={hcmNotice} alt="Chỉ giao hàng TP. Hồ Chí Minh" />
          </div>

          {/* Price */}
          <div className="pd-price-row">
            <span className="pd-price">{formatPrice(product.price)}</span>
            {product.oldPrice > product.price && (
              <>
                <span className="pd-old-price">{formatPrice(product.oldPrice)}</span>
                {savings > 0 && (
                  <span className="pd-savings">Tiết kiệm {formatPrice(savings)}</span>
                )}
              </>
            )}
          </div>

          {/* Quantity */}
          <div className="pd-qty-row">
            <button className="pd-qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
            <span className="pd-qty-val">{qty}</span>
            <button className="pd-qty-btn" onClick={() => setQty((q) => q + 1)}>+</button>
          </div>

          {/* CTA buttons */}
          <div className="pd-cta">
            <button className="pd-btn pd-btn--cart">THÊM VÀO GIỎ</button>
            <button className="pd-btn pd-btn--buy">MUA NGAY</button>
          </div>

          {/* Services */}
          <div className="pd-services">
            <div className="pd-service-item">
              <span className="pd-service-icon"><img src={serviceIcon1} alt="4h Delivery" /></span>
              <span>Giao Hàng Nội Thành 4 Giờ</span>
            </div>
            <div className="pd-service-item">
              <span className="pd-service-icon"><img src={serviceIcon2} alt="National Delivery" /></span>
              <span>Giao Hàng Toàn Quốc Với Thực Phẩm Khô</span>
            </div>
            <div className="pd-service-item">
              <span className="pd-service-icon"><img src={serviceIcon3} alt="Check on Delivery" /></span>
              <span>Kiểm Tra Nhận Hàng</span>
            </div>
            <div className="pd-service-item">
              <span className="pd-service-icon"><img src={serviceIcon4} alt="48h Return" /></span>
              <span>Đổi trả trong 48 giờ nếu sản phẩm không đạt chất lượng cam kết</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Reviews (full-width) ───────────────────────────────────────────── */}
      <section className="pd-section">
        <h2 className="pd-reviews-heading">Đánh giá sản phẩm</h2>
        
        <div className="pd-rating-summary">
          <div className="pd-rating-summary-content">
            <div className="pd-rating-overall">
              <div className="pd-rating-score">
                <span className="pd-score-big">5.0</span>
                <span className="pd-score-total">/5</span>
              </div>
              <StarRow rating={5} size={14} className="pd-summary-stars" />
              <div className="pd-review-count-text">Dựa trên {product.reviewCount} đánh giá</div>
            </div>

            <div className="pd-rating-divider"></div>

            <div className="pd-rating-bars">
              <RatingBar stars={5} percentage={100} count={2} />
              <RatingBar stars={4} percentage={0} count={0} />
              <RatingBar stars={3} percentage={0} count={0} />
              <RatingBar stars={2} percentage={0} count={0} />
              <RatingBar stars={1} percentage={0} count={0} />
            </div>
          </div>
          
            <div className="pd-rating-actions">
              <button 
                className={`pd-btn-action ${isReviewFormOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsReviewFormOpen(!isReviewFormOpen);
                  setIsQAFormOpen(false);
                }}
              >
                <FaRegCommentDots size={18} /> Viết đánh giá
              </button>
              <button 
                className={`pd-btn-action ${isQAFormOpen ? 'active' : ''}`}
                onClick={() => {
                  setIsQAFormOpen(!isQAFormOpen);
                  setIsReviewFormOpen(false);
                }}
              >
                <FaRegEdit size={18} /> Đặt câu hỏi
              </button>
            </div>
          </div>
        
        {/* ── Review Form ─────────────────────────────────────────────────── */}
        {isReviewFormOpen && (
          <div className="pd-form-wrapper">
            <form className="pd-review-form" onSubmit={(e) => e.preventDefault()}>
              <h5 className="pd-form-title">ĐÁNH GIÁ SẢN PHẨM</h5>
              <div className="pd-form-row">
                <div className="pd-form-group">
                  <label>Tên *</label>
                  <input type="text" placeholder="Nhập tên của bạn" required />
                </div>
                <div className="pd-form-group">
                  <label>Email *</label>
                  <input type="email" placeholder="Nhập email của bạn" required />
                </div>
              </div>
              <div className="pd-form-group">
                <label>Chọn đánh giá của bạn *</label>
                <div className="pd-form-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    s <= formRating 
                      ? <FaStar key={s} size={20} className="pd-star-selectable active" onClick={() => setFormRating(s <= formRating ? s - 1 : s)} />
                      : <FaRegStar key={s} size={20} className="pd-star-selectable" onClick={() => setFormRating(s)} />
                  ))}
                </div>
              </div>

              <div className="pd-form-group">
                <label>Tiêu đề đánh giá *</label>
                <input type="text" placeholder="Nhập tiêu đề đánh giá" required />
              </div>

              <div className="pd-form-group">
                <label>Nội dung đánh giá *</label>
                <textarea rows="4" placeholder="Viết đánh giá của bạn ở đây..." required></textarea>
              </div>

              <div className="pd-form-actions-right">
                <button type="submit" className="pd-btn-submit-pill">GỬI ĐÁNH GIÁ</button>
              </div>
            </form>
          </div>
        )}

        {/* ── QA Form ────────────────────────────────────────────────────── */}
        {isQAFormOpen && (
          <div className="pd-form-wrapper">
            <form className="pd-qa-form" onSubmit={(e) => e.preventDefault()}>
              <h5 className="pd-form-title">ĐẶT CÂU HỎI</h5>
              <div className="pd-form-row">
                <div className="pd-form-group">
                  <label>Tên *</label>
                  <input type="text" placeholder="Nhập tên của bạn" required />
                </div>
                <div className="pd-form-group">
                  <label>Email *</label>
                  <input type="email" placeholder="Nhập email của bạn" required />
                </div>
              </div>

              <div className="pd-form-group">
                <label>Nội dung câu hỏi *</label>
                <textarea rows="4" placeholder="Viết câu hỏi của bạn ở đây..." required></textarea>
              </div>

              <div className="pd-form-actions-right">
                <button type="submit" className="pd-btn-submit-pill">GỬI CÂU HỎI</button>
              </div>
            </form>
          </div>
        )}

        <div className="pd-tabs">
          <button
            className={`pd-tab ${activeTab === 'review' ? 'pd-tab--active' : ''}`}
            onClick={() => setActiveTab('review')}
          >
            Đánh giá <span className="pd-tab-count">{product.reviewCount}</span>
          </button>
          <button
            className={`pd-tab ${activeTab === 'qa' ? 'pd-tab--active' : ''}`}
            onClick={() => setActiveTab('qa')}
          >
            Câu hỏi &amp; trả lời <span className="pd-tab-count">0</span>
          </button>
        </div>

        <div className="pd-tab-content">
          {activeTab === 'review' && (
            <div className="pd-reviews-list">
              {product.reviews.map((rev) => (
                <div key={rev.id} className="pd-review-item">
                  <div className="pd-review-header">
                    <div className="pd-review-avatar" style={{ backgroundColor: rev.avatarColor }}>
                      {rev.avatar}
                      {rev.isVerified && <div className="pd-verified-tick">✔</div>}
                    </div>
                    <div className="pd-review-user-info">
                      <div className="pd-review-user-row">
                        <StarRow rating={rev.rating} size={14} />
                        <span className="pd-review-date">{rev.date}</span>
                      </div>
                      <div className="pd-review-user-name">
                        {rev.user}
                      </div>
                    </div>
                  </div>
                  <div className="pd-review-body">
                    <h4 className="pd-review-title">{rev.title}</h4>
                    <p className="pd-review-comment">{rev.comment}</p>
                  </div>
                </div>
              ))}
              <div className="pd-pagination">
                <button className="pd-page-btn pd-page-btn--active">1</button>
              </div>
            </div>
          )}
          {activeTab === 'qa' && (
            <p className="pd-empty-state">Chưa có câu hỏi nào.</p>
          )}
        </div>
      </section>

      {/* ── Recently Viewed (full-width) ───────────────────────────────────── */}
      <section className="pd-section">
        <h2 className="pd-section-title">Sản phẩm đã xem</h2>
        <ProductSlider 
          products={recentlyViewed} 
          slidesPerView={6} 
          prevEl={recentPrev} 
          setPrevEl={setRecentPrev} 
          nextEl={recentNext} 
          setNextEl={setRecentNext} 
        />
      </section>

      {/* ── Lightbox Modal ─────────────────────────────────────────────── */}
      <div className={`pd-lightbox ${isLightboxOpen ? 'pd-lightbox--open' : ''}`}>
        <div className="pd-lightbox-content">
          {/* Top Controls */}
          <div className="pd-lightbox-controls">
            <button 
              className={`pd-lb-action ${lbPlaying ? 'pd-lb-action--active' : ''}`} 
              onClick={() => {
                  if(!lbPlaying && lbIndex === product.images.length - 1) setLbIndex(0);
                  setLbPlaying(!lbPlaying);
              }}
              title={lbPlaying ? "Tạm dừng" : "Phát tất cả"}
            >
              {lbPlaying ? <FaPause /> : <FaPlay />}
            </button>
            <button className="pd-lb-action" title="Phóng to"><FaSearch /></button>
            <button className="pd-lb-action" title="Xem lưới"><FaThLarge /></button>
            <button 
              className="pd-lb-action" 
              onClick={() => { setIsLightboxOpen(false); setLbPlaying(false); }}
              title="Đóng"
            >
              <FaTimes size={14} />
            </button>
          </div>

          {/* Navigation */}
          <button 
            className="pd-lb-arrow pd-lb-arrow--prev" 
            onClick={() => setLbIndex((i) => (i > 0 ? i - 1 : product.images.length - 1))}
          >
            <FaChevronLeft />
          </button>
          
          <img className="pd-lightbox-image" src={product.images[lbIndex]} alt="Product view" />
          
          <button 
            className="pd-lb-arrow pd-lb-arrow--next" 
            onClick={() => setLbIndex((i) => (i < product.images.length - 1 ? i + 1 : 0))}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

    </div>
  );
};

export default ProductDetail;

