import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaStar, FaRegStar, FaStarHalfAlt, FaChevronLeft, FaChevronRight, FaFacebookF, FaTwitter, FaPinterestP, FaLink, FaPlay, FaPause, FaSearch, FaThLarge, FaTimes, FaRegCommentDots, FaRegEdit } from 'react-icons/fa';
import { SiMessenger } from 'react-icons/si';
import ProductCard from '../../components/ProductCard';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './ProductDetail.css';
import { getProductByCode, searchProducts } from '../../api/product';
import { createReview, getReviewsByProductId } from '../../api/review';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';
import { addCartItem } from '../../api/cart';
import { getToken } from '../../services/localStorageService';
import { useSelector } from 'react-redux';
import { message } from 'antd';
import { debounce } from 'lodash';
import { useNavigate } from 'react-router-dom';
import CustomPagination from '../../components/CustomPagination/CustomPagination';

// ── Service & Notice images ──────────────────────────────────────────────────
import hcmNotice from '../../assets/images/hcm2.jpg';
import serviceIcon1 from '../../assets/images/product_deliverly_1_ico.png';
import serviceIcon2 from '../../assets/images/product_deliverly_2_ico.png';
import serviceIcon3 from '../../assets/images/product_deliverly_3_ico.png';
import serviceIcon4 from '../../assets/images/product_deliverly_4_ico.png';

// ── Mock data ─────────────────────────────────────────────────────────────────
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
  image: serviceIcon1, // Placeholder
  hoverImage: serviceIcon1,
}));

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

// ── Helpers ───────────────────────────────────────────────────────────────────
const formatPrice = (n) => (n ? n.toLocaleString('vi-VN') + '₫' : 'Liên hệ');

const StarRow = ({ rating = 0, size = 14, className = "" }) => {
  const safeRating = (typeof rating === 'number' && !isNaN(rating)) ? Math.max(0, Math.min(5, rating)) : 0;
  const fullStars = Math.floor(safeRating);
  const decimal = safeRating - fullStars;
  const hasHalf = decimal >= 0.5;
  const emptyStars = Math.max(0, 5 - fullStars - (hasHalf ? 1 : 0));

  return (
    <div className={`pd-star-row ${className}`}>
      {[...Array(fullStars)].map((_, i) => (
        <FaStar key={`full-${i}`} size={size} className="star-filled" />
      ))}
      {hasHalf && (
        <FaStarHalfAlt key="half" size={size} className="star-filled" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <FaRegStar key={`empty-${i}`} size={size} className="star-empty" />
      ))}
    </div>
  );
};

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
  const { code } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedData, setRelatedData] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);
  const [reviews, setReviews] = useState([]);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewPage, setReviewPage] = useState(1);
  const [totalReviewPages, setTotalReviewPages] = useState(1);
  const [totalReviewItems, setTotalReviewItems] = useState(0);
  const [ratingStats, setRatingStats] = useState({ 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 });
  const [qty, setQty] = useState(1);
  const userId = useSelector((state) => state.user.id);
  const navigate = useNavigate();
  const [descExpanded, setDescExpanded] = useState(false);
  const [hasOverflow, setHasOverflow] = useState(false);
  const descRef = useRef(null);
  const [activeTab, setActiveTab] = useState('review');
  const [bestSellingProducts, setBestSellingProducts] = useState([]);
  const [bestSellingLoading, setBestSellingLoading] = useState(false);

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

  // Fetch reviews
  const fetchReviews = async (page = 1) => {
    if (!product || !product.id) return;
    setReviewLoading(true);
    try {
      const resp = await getReviewsByProductId(product.id, page, 5);
      if (resp) {
        setReviews(resp.data || []);
        setTotalReviewPages(resp.totalPage || 1);
        setTotalReviewItems(resp.totalElements || 0);
        setReviewPage(page);
        
        // Calculate breakdown from the totalElements if we could, 
        // but backend doesn't provide it yet. For now, let's calculate 
        // from what we have or fetch a larger set for stats once.
        if (page === 1) {
           const allResp = await getReviewsByProductId(product.id, 1, 1000);
           if (allResp && allResp.data) {
             const stats = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
             allResp.data.forEach(r => {
                if (stats[r.rating] !== undefined) stats[r.rating]++;
             });
             setRatingStats(stats);
           }
        }
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setReviewLoading(false);
    }
  };

  const handleAddToCart = debounce(async (isBuy) => {
    if (product.inventoryQuantity <= 0) {
      message.warning('Sản phẩm đã hết hàng!');
      return;
    }

    if (!getToken()) {
      const guestCart = JSON.parse(localStorage.getItem('guestCart')) || { items: [] };
      const existingItem = guestCart.items.find((item) => item.productId === product.id);
      if (existingItem) {
        if (existingItem.quantity + qty > product.inventoryQuantity) {
          message.warning(`Số lượng tối đa bạn có thể thêm là ${product.inventoryQuantity - existingItem.quantity}`);
          return;
        }
        existingItem.quantity += qty;
      } else {
        if (qty > product.inventoryQuantity) {
           message.warning(`Sản phẩm này chỉ còn ${product.inventoryQuantity} trong kho`);
           return;
        }
        guestCart.items.push({
          productId: product.id,
          productCode: product.code,
          productName: product.name,
          price: product.price,
          discountPrice: product.discountPrice || null,
          images: product.images || [],
          quantity: qty,
          inventoryQuantity: product.inventoryQuantity,
        });
      }
      localStorage.setItem('guestCart', JSON.stringify(guestCart));
      window.dispatchEvent(new Event('cartUpdated'));
      if (isBuy) navigate('/cart');
      else message.success('Đã thêm vào giỏ hàng');
      return;
    }

    try {
      const data = {
        userId: userId,
        productId: product.id,
        quantity: qty,
        updatedQuantity: qty,
      };
      await addCartItem(data);
      window.dispatchEvent(new Event('cartUpdated'));
      if (isBuy) navigate('/cart');
      else message.success('Đã thêm vào giỏ hàng');
    } catch {
      message.error('Có lỗi xảy ra, vui lòng thử lại!');
    }
  }, 500);

  useEffect(() => {
    fetchReviews(1);
  }, [product]);

  // Format relative time helper
  const getRelativeTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInSeconds = Math.floor((now - date) / 1000);
    
    if (diffInSeconds < 60) return 'Vừa xong';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} phút trước`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} giờ trước`;
    
    const diffInDays = Math.floor(diffInSeconds / 86400);
    if (diffInDays < 30) return `${diffInDays} ngày trước`;
    if (diffInDays < 365) return `${Math.floor(diffInDays / 30)} tháng trước`;
    return `${Math.floor(diffInDays / 365)} năm trước`;
  };

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    if (parts.length === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  // Check if description is too long
  useEffect(() => {
    if (descRef.current && product?.description) {
      const isOverflowing = descRef.current.scrollHeight > 300;
      setHasOverflow(isOverflowing);
    }
  }, [product?.description, descExpanded]);

  // Fetch product data
  useEffect(() => {
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const data = await getProductByCode(code);
        setProduct(data);
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [code]);

  // Fetch related products
  useEffect(() => {
    const fetchRelated = async () => {
      if (!product || !product.categoryCodes || product.categoryCodes.length === 0) return;
      setRelatedLoading(true);
      try {
        const filters = {
          categoryCodes: product.categoryCodes
        };
        const response = await searchProducts(filters, 1, 10);
        if (response && response.data) {
          // Lọc bỏ sản phẩm hiện tại và map sang format của ProductCard
          const filtered = response.data
            .filter(p => p.code !== product.code)
            .map(mapProductResponse);
          setRelatedData(filtered);
        }
      } catch (error) {
        console.error("Error fetching related products:", error);
      } finally {
        setRelatedLoading(false);
      }
    };
    fetchRelated();
  }, [product]);

  // Fetch best selling products
  useEffect(() => {
    const fetchBestSelling = async () => {
      setBestSellingLoading(true);
      try {
        const response = await searchProducts({ sortBy: 'soldQuantity', direction: 'DESC' }, 1, 18);
        if (response && response.data) {
          setBestSellingProducts(response.data.map(mapProductResponse));
        }
      } catch (error) {
        console.error("Error fetching best selling products:", error);
      } finally {
        setBestSellingLoading(false);
      }
    };
    fetchBestSelling();
  }, []);

  // Lightbox 'Play' logic
  useEffect(() => {
    let interval;
    if (lbPlaying && isLightboxOpen && product?.images?.length > 0) {
      interval = setInterval(() => {
        setLbIndex((prev) => {
          if (prev >= product.images.length - 1) {
            setLbPlaying(false);
            return 0;
          }
          return prev + 1;
        });
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [lbPlaying, isLightboxOpen, product?.images]);

  if (loading) return <div className="pd-page" style={{ textAlign: 'center', padding: '100px 0' }}>Đang tải tin sản phẩm...</div>;
  if (!product) return <div className="pd-page" style={{ textAlign: 'center', padding: '100px 0' }}>Sản phẩm không tồn tại.</div>;

  // Pricing logic matching backend
  const currentPrice = product.discountPrice > 0 ? product.discountPrice : product.price;
  const oldPrice = product.discountPrice > 0 ? product.price : null;
  const discountPercent = product.percent;
  const savings = oldPrice ? oldPrice - currentPrice : 0;

  // Process images
  const productImages = product.images && product.images.length > 0 
    ? product.images.map(img => `${IMAGE_URL}/${img}`)
    : [DEFAULT_IMAGE];

  const renderDescription = (text) => {
    if (!text) return null;
    return text.split('\n').map((line, index) => {
      const trimmedText = line.trim();
      if (!trimmedText && index > 0) return <br key={index} />;
      
      const isBullet = trimmedText.startsWith('•');
      // Bôi đậm nếu dòng không bắt đầu bằng dấu • (bao gồm dòng có dấu - và dòng văn bản thường)
      const isHeader = !isBullet;
      
      return (
        <div key={index} className={`pd-desc-line ${isBullet ? 'pd-desc-bullet' : ''} ${isHeader ? 'pd-desc-header' : ''}`}>
          {line}
        </div>
      );
    });
  };

  return (
    <div className="pd-page">
      {/* ── Breadcrumb ─────────────────────────────────────────────────────── */}
      <nav className="pd-breadcrumb">
        <Link to="/">Trang chủ</Link>
        <span className="pd-bc-sep">/</span>
        <Link to="/collections/trai-cay">{product.categoryCodes?.[0] || 'Sản phẩm'}</Link>
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
                {productImages.map((img, i) => (
                  <div
                    key={i}
                    className={`pd-thumb ${activeThumb === i ? 'pd-thumb--active' : ''}`}
                    onClick={() => {
                        setActiveThumb(i);
                        if(gallerySwiper) gallerySwiper.slideToLoop(i);
                    }}
                  >
                    <img src={img} alt={`Ảnh ${i + 1}`} onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
                  </div>
                ))}
              </div>

              <div className="pd-main-image-wrap">
                {discountPercent > 0 && (
                  <div className="pd-discount-badge">
                    <span>-{discountPercent}%</span>
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
                    pagination={false}
                    autoplay={{ delay: 3000, disableOnInteraction: false }}
                    loop={productImages.length > 1}
                  >
                    {productImages.map((img, i) => (
                      <SwiperSlide key={i}>
                        <img 
                          className="pd-main-image" 
                          src={img} 
                          alt={`${product.name} ${i + 1}`} 
                          onError={(e) => { e.target.src = DEFAULT_IMAGE; }}
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
            {relatedLoading ? (
              <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
            ) : relatedData.length > 0 ? (
                <ProductSlider 
                products={relatedData} 
                slidesPerView={3} 
                prevEl={relatedPrev} 
                setPrevEl={setRelatedPrev} 
                nextEl={relatedNext} 
                setNextEl={setRelatedNext} 
              />
            ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Chưa có sản phẩm liên quan.</div>
            )}
          </section>

          {/* Description */}
          <section className="pd-section pd-section--left">
            <h2 className="pd-desc-heading">MÔ TẢ SẢN PHẨM</h2>
            <div 
              ref={descRef}
              className={`pd-desc-body ${descExpanded ? 'pd-desc-body--expanded' : ''}`}
            >
              {renderDescription(product.description)}
              {!descExpanded && hasOverflow && <div className="pd-desc-fade"></div>}
            </div>
            {hasOverflow && (
              <button className="pd-desc-toggle" onClick={() => setDescExpanded((v) => !v)}>
                {descExpanded ? '- Rút gọn nội dung' : '+ Xem thêm nội dung'}
              </button>
            )}
          </section>
        </div>

        {/* ══ RIGHT COLUMN: product info ══ */}
        <div className="pd-info pd-info--sticky">
          {/* Meta */}
          <div className="pd-meta">
            <span className="pd-meta-item">Thương hiệu: <strong>{product.branch || 'Đang cập nhật'}</strong></span>
            <span className="pd-meta-divider">|</span>
            <span className="pd-meta-item">Tình trạng: <strong className="pd-status--instock">{product.inventoryQuantity > 0 ? 'Còn hàng' : 'Hết hàng'}</strong></span>
          </div>

          <h1 className="pd-title">{product.name}</h1>
          <p className="pd-sku">Mã sản phẩm: <strong>{product.code}</strong></p>

          {/* Delivery notice */}
          <div className="pd-delivery-notice">
            <img src={hcmNotice} alt="Chỉ giao hàng TP. Hồ Chí Minh" />
          </div>

          {/* Price */}
          <div className="pd-price-row">
            <span className="pd-price">{formatPrice(currentPrice)}</span>
            {oldPrice > currentPrice && (
              <>
                <span className="pd-old-price">{formatPrice(oldPrice)}</span>
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
            <button className="pd-btn pd-btn--cart" onClick={() => handleAddToCart(false)}>THÊM VÀO GIỎ</button>
            <button className="pd-btn pd-btn--buy" onClick={() => handleAddToCart(true)}>MUA NGAY</button>
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
                <span className="pd-score-big">{product.avgRating?.toFixed(1) || '0.0'}</span>
                <span className="pd-score-total">/5</span>
              </div>
              <StarRow rating={product.avgRating || 0} size={14} className="pd-summary-stars" />
              <div className="pd-review-count-text">Dựa trên {product.reviewCount || 0} đánh giá</div>
            </div>

            <div className="pd-rating-divider"></div>

            <div className="pd-rating-bars">
              {[5, 4, 3, 2, 1].map(s => {
                const count = ratingStats[s] || 0;
                const percent = totalReviewItems > 0 ? (count / totalReviewItems) * 100 : 0;
                return (
                  <RatingBar key={s} stars={s} percentage={percent} count={count} />
                );
              })}
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
            <form className="pd-review-form" onSubmit={async (e) => {
              e.preventDefault();
              const fd = new FormData(e.target);
              const payload = {
                username: fd.get('email'), // Gửi Email vào trường username
                orderId: null,             // Không có nhập orderId để null
                productId: product.id,
                rating: formRating,
                title: fd.get('title'),
                comment: fd.get('comment')
              };
              try {
                await createReview(payload);
                alert("Gửi đánh giá thành công!");
                setIsReviewFormOpen(false);
                fetchReviews(); // Refresh list
              } catch (err) {
                alert(err.message || "Gửi đánh giá thất bại!");
              }
            }}>
              <h5 className="pd-form-title">ĐÁNH GIÁ SẢN PHẨM</h5>
              <div className="pd-form-row">
                <div className="pd-form-group">
                  <label>Họ tên *</label>
                  <input name="fullName" type="text" placeholder="Nhập họ tên của bạn" required />
                </div>
                <div className="pd-form-group">
                  <label>Email *</label>
                  <input name="email" type="email" placeholder="Nhập email của bạn" required />
                </div>
              </div>
              <div className="pd-form-group">
                <label>Chọn đánh giá của bạn *</label>
                <div className="pd-form-stars">
                  {[1, 2, 3, 4, 5].map((s) => (
                    s <= formRating 
                      ? <FaStar key={s} size={20} className="pd-star-selectable active" onClick={() => setFormRating(s)} />
                      : <FaRegStar key={s} size={20} className="pd-star-selectable" onClick={() => setFormRating(s)} />
                  ))}
                </div>
              </div>

              <div className="pd-form-group">
                <label>Tiêu đề đánh giá *</label>
                <input name="title" type="text" placeholder="Nhập tiêu đề đánh giá" required />
              </div>

              <div className="pd-form-group">
                <label>Nội dung đánh giá *</label>
                <textarea name="comment" rows="4" placeholder="Viết đánh giá của bạn ở đây..." required></textarea>
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
            Đánh giá <span className="pd-tab-count">{product.reviewCount || 0}</span>
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
              {reviewLoading ? (
                <p className="pd-empty-state">Đang tải đánh giá...</p>
              ) : reviews.length > 0 ? (
                <>
                  {reviews.map((r) => (
                    <div key={r.id} className="pd-review-item">
                      <div className="pd-review-avatar">
                        {getInitials(r.fullName || r.username)}
                      </div>
                      <div className="pd-review-body">
                        <div className="pd-review-top">
                          <StarRow rating={r.rating} size={16} />
                          <span className="pd-review-relative-time">{getRelativeTime(r.createdDate)}</span>
                        </div>
                        <div className="pd-review-user-name">
                          {r.fullName || r.username || 'Khách hàng'}
                        </div>
                        <div className="pd-review-content">
                          <h4 className="pd-review-title">{r.title}</h4>
                          <p className="pd-review-text">{r.comment}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  <div className="pd-pagination-wrap">
                    <CustomPagination 
                      current={reviewPage}
                      total={totalReviewItems}
                      pageSize={5}
                      onChange={(page) => fetchReviews(page)}
                      layout='center'
                    />
                  </div>
                </>
              ) : (
                <p className="pd-empty-state">Chưa có đánh giá nào.</p>
              )}
            </div>
          )}
          {activeTab === 'qa' && (
            <p className="pd-empty-state">Chưa có câu hỏi nào.</p>
          )}
        </div>
      </section>

      {/* ── Best Selling (full-width) ───────────────────────────────────── */}
      <section className="pd-section">
        <h2 className="pd-section-title">Sản phẩm bán chạy</h2>
        {bestSellingLoading ? (
          <div style={{ padding: '20px', textAlign: 'center' }}>Đang tải...</div>
        ) : bestSellingProducts.length > 0 ? (
          <ProductSlider 
            products={bestSellingProducts} 
            slidesPerView={6} 
            prevEl={recentPrev} 
            setPrevEl={setRecentPrev} 
            nextEl={recentNext} 
            setNextEl={setRecentNext} 
          />
        ) : (
          <div style={{ padding: '20px', textAlign: 'center', color: '#999' }}>Chưa có sản phẩm bán chạy.</div>
        )}
      </section>

      {/* ── Lightbox Modal ─────────────────────────────────────────────── */}
      <div className={`pd-lightbox ${isLightboxOpen ? 'pd-lightbox--open' : ''}`}>
        <div className="pd-lightbox-content">
          {/* Top Controls */}
          <div className="pd-lightbox-controls">
            <button 
              className={`pd-lb-action ${lbPlaying ? 'pd-lb-action--active' : ''}`} 
              onClick={() => {
                  if(!lbPlaying && lbIndex === productImages.length - 1) setLbIndex(0);
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
            onClick={() => setLbIndex((i) => (i > 0 ? i - 1 : productImages.length - 1))}
          >
            <FaChevronLeft />
          </button>
          
          <img className="pd-lightbox-image" src={productImages[lbIndex]} alt="Product view" onError={(e) => { e.target.src = DEFAULT_IMAGE; }} />
          
          <button 
            className="pd-lb-arrow pd-lb-arrow--next" 
            onClick={() => setLbIndex((i) => (i < productImages.length - 1 ? i + 1 : 0))}
          >
            <FaChevronRight />
          </button>
        </div>
      </div>

    </div>
  );
};
export default ProductDetail;
