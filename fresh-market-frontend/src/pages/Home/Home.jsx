import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';
import { searchProducts } from '../../api/product';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './Home.css';

// Helper component to render product sections
const ProductSection = ({ title, products, prevEl, setPrevEl, nextEl, setNextEl, link }) => (
    <section className="product-section">
        <div className="section-header">
            <h2 className="section-title">{title}</h2>
            <Link to={link || "#"} className="see-more">Xem thêm</Link>
        </div>
        <div className="product-slider-container">
            <Swiper
                modules={[Navigation]}
                spaceBetween={15}
                slidesPerView={6}
                navigation={{ prevEl, nextEl }}
                onBeforeInit={(swiper) => {
                    swiper.params.navigation.prevEl = prevEl;
                    swiper.params.navigation.nextEl = nextEl;
                }}
                breakpoints={{
                    320: { slidesPerView: 2 },
                    640: { slidesPerView: 3 },
                    1024: { slidesPerView: 4 },
                    1200: { slidesPerView: 5 },
                    1400: { slidesPerView: 6 },
                }}
                loop={products.length > 6}
            >
                {products.map((product) => (
                    <SwiperSlide key={product.id || product.code}>
                        <ProductCard product={product} />
                    </SwiperSlide>
                ))}
            </Swiper>
            <div ref={(node) => setPrevEl(node)} className="custom-nav product-prev"><FaChevronLeft /></div>
            <div ref={(node) => setNextEl(node)} className="custom-nav product-next"><FaChevronRight /></div>
        </div>
    </section>
);

// Import images
import slide_1 from '../../assets/images/slide_1.jpg';
import slide_4 from '../../assets/images/slide_4.jpg';
import banner_home_2 from '../../assets/images/banner_home_2.jpg';
import banner_home_3 from '../../assets/images/banner_home_3.jpg';
import banner_home_4 from '../../assets/images/banner_home_4.jpg';
import banner_home_5 from '../../assets/images/banner_home_5.jpg';
import banner_home_6 from '../../assets/images/banner_home_6.jpg';

// Import category icons
import menuIcon1 from '../../assets/images/img_item_category_home_1_medium.png';
import menuIcon2 from '../../assets/images/img_item_category_home_3_medium.png';
import menuIcon3 from '../../assets/images/img_item_category_home_4_medium.png';
import menuIcon4 from '../../assets/images/img_item_category_home_5_medium.png';
import menuIcon5 from '../../assets/images/img_item_category_home_6_medium.png';
import menuIcon6 from '../../assets/images/img_item_category_home_7_medium.png';
import menuIcon7 from '../../assets/images/img_item_category_home_8_medium.png';
import menuIcon8 from '../../assets/images/img_item_category_home_9_medium.png';
import menuIcon9 from '../../assets/images/img_item_category_home_10_medium.png';
import menuIcon10 from '../../assets/images/img_item_category_home_11_medium.png';
import menu2Icon1 from '../../assets/images/img_item_category_home_12_medium.png';
import menu2Icon2 from '../../assets/images/img_item_category_home_13_medium.png';
import menu2Icon3 from '../../assets/images/img_item_category_home_14_medium.png';
import menu2Icon4 from '../../assets/images/img_item_category_home_15_medium.png';
import menu2Icon5 from '../../assets/images/img_item_category_home_16_medium.png';
import menu2Icon6 from '../../assets/images/img_item_category_home_17_medium.png';
import menu2Icon7 from '../../assets/images/img_item_category_home_18_medium.png';
import menu2Icon8 from '../../assets/images/img_item_category_home_19_medium.png';
import menu2Icon9 from '../../assets/images/img_item_category_home_2_medium.png';
import menu2Icon10 from '../../assets/images/img_item_category_home_20_medium.png';

const Home = () => {
    // Navigation states for multiple sliders
    const [heroPrev, setHeroPrev] = React.useState(null);
    const [heroNext, setHeroNext] = React.useState(null);
    const [promoPrev, setPromoPrev] = React.useState(null);
    const [promoNext, setPromoNext] = React.useState(null);
    const [hotDealPrev, setHotDealPrev] = React.useState(null);
    const [hotDealNext, setHotDealNext] = React.useState(null);
    const [newsPrev, setNewsPrev] = React.useState(null);
    const [newsNext, setNewsNext] = React.useState(null);

    // Dynamic data states
    const [hotDealProducts, setHotDealProducts] = useState([]);
    const [gift83Products, setGift83Products] = useState([]);
    const [fruitGiftProducts, setFruitGiftProducts] = useState([]);
    const [importedFruitProducts, setImportedFruitProducts] = useState([]);
    const [marketProducts, setMarketProducts] = useState([]);
    const [dryFoodProducts, setDryFoodProducts] = useState([]);
    const [organicFoodProducts, setOrganicFoodProducts] = useState([]);
    const [treeGiftProducts, setTreeGiftProducts] = useState([]);

    const mapProductResponse = (p) => ({
        id: p.id,
        code: p.code,
        name: p.name,
        origin: p.supplierCode || 'N/A', // Using supplierCode as origin if not available
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

    useEffect(() => {
        const fetchAllHomeData = async () => {
            try {
                const sections = [
                    { setter: setHotDealProducts, code: 'khuyen-mai' },
                    { setter: setGift83Products, code: 'qua-tang-8-3' },
                    { setter: setFruitGiftProducts, code: 'qua-tang-trai-cay' },
                    { setter: setImportedFruitProducts, code: 'trai-cay-nhap' },
                    { setter: setMarketProducts, code: 'di-cho-online' },
                    { setter: setDryFoodProducts, code: 'thuc-pham-kho' },
                    { setter: setOrganicFoodProducts, code: 'thuc-pham-huu-co' },
                    { setter: setTreeGiftProducts, code: 'qua-tang-cay-xanh' },
                ];

                await Promise.all(sections.map(async (section) => {
                    try {
                        const response = await searchProducts({ categoryCodes: [section.code] }, 1, 20);
                        if (response && response.data) {
                            section.setter(response.data.map(mapProductResponse));
                        }
                    } catch (err) {
                        console.error(`Error fetching products for ${section.code}:`, err);
                    }
                }));
            } catch (error) {
                console.error("Error fetching homepage products:", error);
            }
        };

        fetchAllHomeData();
    }, []);

    // New navigation states
    const [gift83Prev, setGift83Prev] = React.useState(null);
    const [gift83Next, setGift83Next] = React.useState(null);
    const [fruitGiftPrev, setFruitGiftPrev] = React.useState(null);
    const [fruitGiftNext, setFruitGiftNext] = React.useState(null);
    const [importedPrev, setImportedPrev] = React.useState(null);
    const [importedNext, setImportedNext] = React.useState(null);
    const [marketPrev, setMarketPrev] = React.useState(null);
    const [marketNext, setMarketNext] = React.useState(null);
    const [dryFoodPrev, setDryFoodPrev] = React.useState(null);
    const [dryFoodNext, setDryFoodNext] = React.useState(null);
    const [organicPrev, setOrganicPrev] = React.useState(null);
    const [organicNext, setOrganicNext] = React.useState(null);
    const [treePrev, setTreePrev] = React.useState(null);
    const [treeNext, setTreeNext] = React.useState(null);



    const featuredNews = [
        { id: 1, title: 'Cúng Ông Táo 2026: Ngày Giờ, Mâm Cúng & Cách Cúng Đúng Phong Tục Việt', date: '06 Tháng 01, 2026', description: 'Cúng Ông Táo là gì? Ý nghĩa trong văn hóa Việt Cúng Ông Táo (hay còn gọi là lễ tiễn Ông...', image: slide_1, link: '/news/cung-ong-tao-2026' },
        { id: 2, title: 'Farmers Market Bắt Trend 12 Trái Nho Ước Nguyện - Từ Siêu Thị Sạch Đến Xu Hướng...', date: '31 Tháng 12, 2025', description: 'Năm cuối năm luôn là thời điểm các trend lễ hội đón giao thừa bùng nổ trên mạng xã hội...', image: slide_4, link: '/news/farmers-market-bat-trend' },
        { id: 3, title: 'Mùng 1 Tết Tây Nên Làm Gì Để Cả Năm May Mắn Và Suôn Sẻ?', date: '30 Tháng 12, 2025', description: 'Mùng 1 Tết Tây – khởi đầu cho một năm mới Mùng 1 Tết Tây (ngày 1/1 Dương Lịch) không chỉ...', image: banner_home_6, link: '/news/mung-1-tet-tay' },
        { id: 4, title: 'Cúng Ông Táo 2026: Ngày Giờ, Mâm Cúng & Cách Cúng Đúng Phong Tục Việt (Tiếp)', date: '06 Tháng 01, 2026', description: 'Cúng Ông Táo là gì? Ý nghĩa trong văn hóa Việt Cúng Ông Táo (hay còn gọi là lễ tiễn Ông...', image: slide_1, link: '/news/cung-ong-tao-2026-p2' },
        { id: 5, title: 'Farmers Market Bắt Trend 12 Trái Nho Ước Nguyện - Tiếp tục xu hướng...', date: '31 Tháng 12, 2025', description: 'Năm cuối năm luôn là thời điểm các trend lễ hội đón giao thừa bùng nổ trên mạng xã hội...', image: slide_4, link: '/news/farmers-market-bat-trend-cont' },
        { id: 6, title: 'Mùng 1 Tết Tây Nên Làm Gì Để Cả Năm May Mắn Và Suôn Sẻ? (Phần 2)', date: '30 Tháng 12, 2025', description: 'Mùng 1 Tết Tây – khởi đầu cho một năm mới Mùng 1 Tết Tây (ngày 1/1 Dương Lịch) không chỉ...', image: banner_home_6, link: '/news/mung-1-tet-tay-p2' }
    ];

    const categories = [
        { id: 1, code: 'khuyen-mai', name: 'Khuyến Mãi', icon: menuIcon1, isHot: true },
        { id: 2, code: 'gio-hoa-qua-nhap-khau', name: 'Giỏ Quà', icon: menuIcon2 },
        { id: 3, code: 'trai-cay-nhap', name: 'Trái Cây Nhập', icon: menuIcon3 },
        { id: 4, code: 'trai-cay-viet', name: 'Trái Cây Việt', icon: menuIcon4 },
        { id: 5, code: 'nho-xanh-khong-hat', name: 'Nho Các Loại', icon: menuIcon5 },
        { id: 6, code: 'nhan-sam', name: 'Nhân Sâm', icon: menuIcon6 },
        { id: 7, code: 'yen-sao', name: 'Yến Sào', icon: menuIcon7 },
        { id: 8, code: 'mat-ong', name: 'Mật Ong', icon: menuIcon8 },
        { id: 9, code: 'thuc-pham-huu-co', name: 'TP Hữu Cơ', icon: menuIcon9 },
        { id: 10, code: 'gia-vi', name: 'Gia Vị', icon: menuIcon10 },
        { id: 11, code: 'rau-cu', name: 'Rau Củ Quả', icon: menu2Icon1 },
        { id: 12, code: 'thuc-pham-dong-mat', name: 'TP Đông Mát', icon: menu2Icon2 },
        { id: 13, code: 'thit-ca-trung', name: 'Thịt, Cá, Trứng', icon: menu2Icon3 },
        { id: 14, code: 'gao-cac-loai', name: 'Gạo', icon: menu2Icon4 },
        { id: 15, code: 'banh-keo-cac-loai', name: 'Bánh Kẹo', icon: menu2Icon5 },
        { id: 16, code: 'hat-trai-cay-say', name: 'Hạt, Trái Cây Sấy', icon: menu2Icon6 },
        { id: 17, code: 'thuc-uong', name: 'Thức Uống', icon: menu2Icon7 },
        { id: 18, code: 'hoa-cay', name: 'Cây Hoa', icon: menu2Icon8 },
        { id: 19, code: 'hoa', name: 'Hoa', icon: menu2Icon9 },
        { id: 20, code: 'do-dung-gia-dinh-2', name: 'Hóa Mỹ Phẩm', icon: menu2Icon10 },
    ];


    return (
        <div className="home-container">
            {/* Top Slider */}
            <section className="hero-slider">
                <Swiper
                    modules={[Navigation, Pagination, Autoplay]}
                    spaceBetween={0} slidesPerView={1}
                    navigation={{ prevEl: heroPrev, nextEl: heroNext }}
                    onBeforeInit={(swiper) => {
                        swiper.params.navigation.prevEl = heroPrev;
                        swiper.params.navigation.nextEl = heroNext;
                    }}
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000, disableOnInteraction: false }}
                    loop={true}
                >
                    <SwiperSlide><Link to="/collections/gio-hoa-qua-nhap-khau" className="hero-slide"><img src={slide_1} alt="Slide 1" /></Link></SwiperSlide>
                    <SwiperSlide><Link to="/collections/qua-tang-cay-xanh" className="hero-slide"><img src={slide_4} alt="Slide 4" /></Link></SwiperSlide>
                </Swiper>
                <div ref={(node) => setHeroPrev(node)} className="custom-nav hero-prev"><FaChevronLeft /></div>
                <div ref={(node) => setHeroNext(node)} className="custom-nav hero-next"><FaChevronRight /></div>
            </section>

            {/* Bottom Slider */}
            <section className="promo-slider-container">
                <Swiper
                    modules={[Navigation]}
                    spaceBetween={20} slidesPerView={1}
                    navigation={{ prevEl: promoPrev, nextEl: promoNext }}
                    onBeforeInit={(swiper) => {
                        swiper.params.navigation.prevEl = promoPrev;
                        swiper.params.navigation.nextEl = promoNext;
                    }}
                    breakpoints={{ 480: { slidesPerView: 1 }, 640: { slidesPerView: 2 }, 1024: { slidesPerView: 3 }, 1200: { slidesPerView: 4 } }}
                    loop={true}
                >
                    <SwiperSlide className="promo-slide"><Link to="/collections/nho-xanh-khong-hat" className="promo-card"><img src={banner_home_2} alt="2" /></Link></SwiperSlide>
                    <SwiperSlide className="promo-slide"><Link to="/searchs?name=keo-huu-co" className="promo-card"><img src={banner_home_3} alt="3" /></Link></SwiperSlide>
                    <SwiperSlide className="promo-slide"><Link to="/collections/thuc-pham-huu-co" className="promo-card"><img src={banner_home_4} alt="4" /></Link></SwiperSlide>
                    <SwiperSlide className="promo-slide"><Link to="/collections/di-cho-online" className="promo-card"><img src={banner_home_5} alt="5" /></Link></SwiperSlide>
                    <SwiperSlide className="promo-slide"><Link to="/collections/cham-soc-suc-khoe" className="promo-card"><img src={banner_home_6} alt="6" /></Link></SwiperSlide>
                </Swiper>
                <div ref={(node) => setPromoPrev(node)} className="custom-nav promo-prev"><FaChevronLeft /></div>
                <div ref={(node) => setPromoNext(node)} className="custom-nav promo-next"><FaChevronRight /></div>
            </section>

            {/* Categories */}
            <section className="categories-section">
                <div className="categories-grid">
                    {categories.map((cat) => (
                        <Link key={cat.id} to={`/collections/${cat.code}`} className={`category-item ${cat.isHot ? 'hot-deal' : ''}`} style={{ textDecoration: 'none' }}>
                            <div className="category-icon">{cat.isHot ? <div className="hot-deal-box"><span>HOT</span><span>DEAL</span></div> : <img src={cat.icon} alt={cat.name} />}</div>
                            <span className="category-name">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* Product Sections */}
            <ProductSection title="HOT DEAL" products={hotDealProducts} prevEl={hotDealPrev} setPrevEl={setHotDealPrev} nextEl={hotDealNext} setNextEl={setHotDealNext} link="/collections/khuyen-mai" />
            <ProductSection title="Quà Tặng 8/3" products={gift83Products} prevEl={gift83Prev} setPrevEl={setGift83Prev} nextEl={gift83Next} setNextEl={setGift83Next} link="/collections/qua-tang-8-3" />
            <ProductSection title="Quà Tặng Trái Cây" products={fruitGiftProducts} prevEl={fruitGiftPrev} setPrevEl={setFruitGiftPrev} nextEl={fruitGiftNext} setNextEl={setFruitGiftNext} link="/collections/qua-tang-trai-cay" />
            <ProductSection title="Trái Cây Nhập" products={importedFruitProducts} prevEl={importedPrev} setPrevEl={setImportedPrev} nextEl={importedNext} setNextEl={setImportedNext} link="/collections/trai-cay-nhap" />
            <ProductSection title="Đi Chợ" products={marketProducts} prevEl={marketPrev} setPrevEl={setMarketPrev} nextEl={marketNext} setNextEl={setMarketNext} link="/collections/di-cho-online" />
            <ProductSection title="Thực Phẩm Khô Các Loại" products={dryFoodProducts} prevEl={dryFoodPrev} setPrevEl={setDryFoodPrev} nextEl={dryFoodNext} setNextEl={setDryFoodNext} link="/collections/thuc-pham-kho" />
            <ProductSection title="Thực Phẩm Hữu Cơ" products={organicFoodProducts} prevEl={organicPrev} setPrevEl={setOrganicPrev} nextEl={organicNext} setNextEl={setOrganicNext} link="/collections/thuc-pham-huu-co" />
            <ProductSection title="Quà Tặng Cây Xanh" products={treeGiftProducts} prevEl={treePrev} setPrevEl={setTreePrev} nextEl={treeNext} setNextEl={setTreeNext} link="/collections/qua-tang-cay-xanh" />

            {/* Featured News */}
            <section className="featured-news-section">
                <h2 className="news-section-title text-center mb-5">Tin tức nổi bật</h2>
                <div className="news-slider-container">
                    <Swiper
                        modules={[Navigation]}
                        spaceBetween={30} slidesPerView={3}
                        navigation={{ prevEl: newsPrev, nextEl: newsNext }}
                        onBeforeInit={(swiper) => {
                            swiper.params.navigation.prevEl = newsPrev;
                            swiper.params.navigation.nextEl = newsNext;
                        }}
                        breakpoints={{ 320: { slidesPerView: 1 }, 768: { slidesPerView: 2 }, 1024: { slidesPerView: 3 } }}
                        loop={true}
                    >
                        {featuredNews.map((news) => (
                            <SwiperSlide key={news.id}>
                                <div className="news-card">
                                    <div className="news-image-wrap"><img src={news.image} alt={news.title} /><span className="news-date-badge">{news.date}</span></div>
                                    <div className="news-content">
                                        <h3 className="news-title">{news.title}</h3>
                                        <p className="news-description">{news.description}</p>
                                        <Link to={news.link} className="news-read-more">Xem thêm <FaChevronRight style={{ fontSize: '10px', marginLeft: '5px' }} /></Link>
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div ref={(node) => setNewsPrev(node)} className="custom-nav news-prev"><FaChevronLeft /></div>
                    <div ref={(node) => setNewsNext(node)} className="custom-nav news-next"><FaChevronRight /></div>
                </div>
            </section>
        </div>
    );
};

export default Home;

