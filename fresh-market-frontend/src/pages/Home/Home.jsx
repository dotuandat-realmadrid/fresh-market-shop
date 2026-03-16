import React from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import ProductCard from '../../components/ProductCard';


// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

import './Home.css';

// Helper component to render product sections
const ProductSection = ({ title, products, prevEl, setPrevEl, nextEl, setNextEl, link }) => (
    <section className="hot-deal-section">
        <div className="section-header">
            <h2 className="section-title">{title}</h2>
            <Link to={link || "#"} className="see-more">Xem thêm</Link>
        </div>
        <div className="hot-deal-slider-container">
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
            <div ref={(node) => setPrevEl(node)} className="custom-nav hot-deal-prev"><FaChevronLeft /></div>
            <div ref={(node) => setNextEl(node)} className="custom-nav hot-deal-next"><FaChevronRight /></div>
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

    const hotDealProducts = [
        { id: 1, name: 'Dâu Hàn Quốc 250g (I0004758)', origin: 'HÀN QUỐC', price: 159000, oldPrice: 199000, discount: 20, rating: 4, ratingCount: 2, soldCount: 4956, isFlashSale: true, image: menu2Icon9, hoverImage: menuIcon1 },
        { id: 2, name: 'Nho đen Nam Phi (Hộp 500G)', origin: 'ÚC', price: 89000, oldPrice: 169000, discount: 47, rating: 0, ratingCount: 0, soldCount: 1549, isFlashSale: false, image: menuIcon5, hoverImage: menu2Icon4 },
        { id: 3, name: 'Xoài cát hòa lộc - 1Kg (I0004873)', origin: 'VIỆT NAM', price: 139000, oldPrice: 179000, discount: 22, rating: 0, ratingCount: 0, soldCount: 2596, isFlashSale: true, image: menuIcon4, hoverImage: menuIcon3 },
        { id: 4, name: 'Sầu riêng cơm Ri6 Huỳnh Lâm (W00315)', origin: 'VIỆT NAM', price: 119000, oldPrice: 169750, discount: 30, rating: 0, ratingCount: 0, soldCount: 1847, isFlashSale: true, image: menu2Icon1, hoverImage: menu2Icon2 },
        { id: 5, name: 'Dừa xiêm xanh Coco MeKo (I0008151)', origin: 'VIỆT NAM', price: 25000, oldPrice: 32000, discount: 22, rating: 0, ratingCount: 0, soldCount: 1746, isFlashSale: false, image: menuIcon7, hoverImage: menuIcon8 },
        { id: 6, name: '[Tươi] Thịt xay heo Meat Master 400 g', origin: 'MEAT MASTER', price: 65000, oldPrice: 72000, discount: 10, rating: 0, ratingCount: 0, soldCount: 1367, isFlashSale: false, image: menu2Icon3, hoverImage: menu2Icon4 },
        { id: 7, name: 'Cam Cara Ruột Đỏ Úc', origin: 'ÚC', price: 89000, oldPrice: 120000, discount: 25, rating: 4, ratingCount: 28, soldCount: 760, image: menuIcon1, hoverImage: menu2Icon1 },
        { id: 8, name: 'Lê Hàn Quốc Premium', origin: 'HÀN QUỐC', price: 145000, oldPrice: 180000, discount: 19, rating: 5, ratingCount: 15, soldCount: 430, image: menuIcon5, hoverImage: menu2Icon2 },
        { id: 9, name: 'Kiwi Vàng New Zealand', origin: 'NEW ZEALAND', price: 220000, oldPrice: 280000, discount: 21, rating: 5, ratingCount: 56, soldCount: 1100, image: menuIcon3, hoverImage: menuIcon2 },
        { id: 10, name: 'Táo Envy Mỹ Size 28', origin: 'MỸ', price: 199000, oldPrice: 250000, discount: 20, rating: 5, ratingCount: 112, soldCount: 2540, image: menuIcon1, hoverImage: menuIcon4 }
    ];

    const gift83Products = [
        { id: 831, name: 'Hộp Quà Trái Cây 8/3 - Mẫu 1', origin: 'VIỆT NAM', price: 850000, oldPrice: 950000, discount: 10, rating: 5, ratingCount: 12, soldCount: 45, image: menu2Icon9, hoverImage: menu2Icon10 },
        { id: 832, name: 'Bó Hoa & Trái Cây 8/3', origin: 'VIỆT NAM', price: 650000, oldPrice: 750000, discount: 13, rating: 5, ratingCount: 8, soldCount: 32, image: menu2Icon8, hoverImage: menu2Icon9 },
        { id: 833, name: 'Hộp Quà Cherry 8/3', origin: 'CHILE', price: 1250000, oldPrice: 1450000, discount: 14, rating: 5, ratingCount: 15, soldCount: 28, image: menuIcon5, hoverImage: menuIcon3 },
        { id: 834, name: 'Set Quà Tặng Sức Khỏe 8/3', origin: 'VIỆT NAM', price: 990000, oldPrice: 1200000, discount: 17, rating: 4, ratingCount: 5, soldCount: 19, image: menuIcon7, hoverImage: menuIcon8 },
        { id: 835, name: 'Giỏ Trái Cây Đẹp 8/3', origin: 'NHẬP KHẨU', price: 1500000, oldPrice: 1800000, discount: 16, rating: 5, ratingCount: 20, soldCount: 56, image: menuIcon2, hoverImage: menuIcon1 },
        { id: 836, name: 'Quà Tặng Tinh Tế 8/3', origin: 'VIỆT NAM', price: 450000, oldPrice: 550000, discount: 18, rating: 4, ratingCount: 4, soldCount: 15, image: menu2Icon5, hoverImage: menu2Icon10 },
        { id: 837, name: 'Hộp Quà 8/3 Yêu Thương', origin: 'VIỆT NAM', price: 720000, oldPrice: 850000, discount: 15, rating: 5, ratingCount: 10, soldCount: 22, image: menu2Icon7, hoverImage: menu2Icon8 },
        { id: 838, name: 'Giỏ Hoa Hồng & Trái Cây', origin: 'VIỆT NAM', price: 1100000, oldPrice: 1300000, discount: 15, rating: 5, ratingCount: 14, soldCount: 18, image: menu2Icon9, hoverImage: menu2Icon1 },
    ];

    const fruitGiftProducts = [
        { id: 21, name: 'Giỏ Trái Cây Cảm Ơn', origin: 'NHẬP KHẨU', price: 1200000, oldPrice: 1500000, discount: 20, rating: 5, ratingCount: 15, soldCount: 124, image: menuIcon2, hoverImage: menuIcon1 },
        { id: 22, name: 'Hộp Trái Cây Cao Cấp', origin: 'NHẬP KHẨU', price: 2500000, oldPrice: 3000000, discount: 16, rating: 5, ratingCount: 8, soldCount: 45, image: menuIcon1, hoverImage: menuIcon2 },
        { id: 23, name: 'Giỏ Trái Cây Sinh Nhật', origin: 'NHẬP KHẨU', price: 1800000, oldPrice: 2100000, discount: 14, rating: 5, ratingCount: 22, soldCount: 89, image: menu2Icon8, hoverImage: menu2Icon9 },
        { id: 24, name: 'Set Quà Tặng Yến Sào & Trái Cây', origin: 'VIỆT NAM', price: 3500000, oldPrice: 4000000, discount: 12, rating: 5, ratingCount: 10, soldCount: 23, image: menuIcon7, hoverImage: menuIcon8 },
        { id: 25, name: 'Hộp Quà Nho Mẫu Đơn', origin: 'NHẬT BẢN', price: 1950000, oldPrice: 2300000, discount: 15, rating: 5, ratingCount: 18, soldCount: 67, image: menuIcon5, hoverImage: menuIcon3 },
        { id: 26, name: 'Giỏ Trái Cây Dâng Lễ', origin: 'VIỆT NAM', price: 950000, oldPrice: 1100000, discount: 13, rating: 4, ratingCount: 5, soldCount: 156, image: menuIcon4, hoverImage: menuIcon3 },
        { id: 27, name: 'Hộp Quà Táo Envy', origin: 'MỸ', price: 1450000, oldPrice: 1700000, discount: 15, rating: 5, ratingCount: 12, soldCount: 34, image: menuIcon3, hoverImage: menuIcon1 },
        { id: 28, name: 'Giỏ Trái Cây Kết Hợp Hoa', origin: 'VIỆT NAM', price: 2200000, oldPrice: 2600000, discount: 15, rating: 5, ratingCount: 9, soldCount: 12, image: menuIcon2, hoverImage: menu2Icon8 },
    ];

    const importedFruitProducts = [
        { id: 31, name: 'Cherry Đỏ Úc Size 28-30', origin: 'ÚC', price: 499000, oldPrice: 650000, discount: 23, rating: 5, ratingCount: 45, soldCount: 890, image: menuIcon1, hoverImage: menuIcon2 },
        { id: 32, name: 'Nho Mẫu Đơn Shine Muscat', origin: 'HÀN QUỐC', price: 650000, oldPrice: 850000, discount: 23, rating: 5, ratingCount: 32, soldCount: 1205, image: menuIcon5, hoverImage: menuIcon3 },
        { id: 33, name: 'Táo Envy Mỹ Size 28', origin: 'MỸ', price: 199000, oldPrice: 250000, discount: 20, rating: 5, ratingCount: 112, soldCount: 2540, image: menuIcon3, hoverImage: menuIcon4 },
        { id: 34, name: 'Cam Cara Ruột Đỏ Úc', origin: 'ÚC', price: 89000, oldPrice: 120000, discount: 25, rating: 4, ratingCount: 28, soldCount: 760, image: slide_1, hoverImage: slide_4 },
        { id: 35, name: 'Lê Hàn Quốc Premium', origin: 'HÀN QUỐC', price: 145000, oldPrice: 180000, discount: 19, rating: 5, ratingCount: 15, soldCount: 430, image: slide_4, hoverImage: slide_1 },
        { id: 36, name: 'Kiwi Vàng New Zealand', origin: 'NEW ZEALAND', price: 220000, oldPrice: 280000, discount: 21, rating: 5, ratingCount: 56, soldCount: 1100, image: menuIcon3, hoverImage: menuIcon2 },
        { id: 37, name: 'Nho đen Nam Phi', origin: 'NAM PHI', price: 125000, oldPrice: 160000, discount: 22, rating: 5, ratingCount: 34, soldCount: 1200, image: menuIcon5, hoverImage: menuIcon1 },
        { id: 38, name: 'Dâu Tây Hàn Quốc', origin: 'HÀN QUỐC', price: 299000, oldPrice: 350000, discount: 15, rating: 5, ratingCount: 89, soldCount: 1500, image: menu2Icon9, hoverImage: menuIcon3 },
    ];

    const marketProducts = [
        { id: 41, name: 'Thăn Bò Úc Tươi (200g)', origin: 'ÚC', price: 145000, oldPrice: 180000, discount: 19, rating: 5, ratingCount: 12, soldCount: 560, image: menu2Icon3, hoverImage: menu2Icon2 },
        { id: 42, name: 'Cá Hồi Nauy Tươi Cắt Khoanh', origin: 'NAUY', price: 210000, oldPrice: 250000, discount: 16, rating: 5, ratingCount: 45, soldCount: 890, image: menu2Icon4, hoverImage: menu2Icon3 },
        { id: 43, name: 'Trứng Gà Ta Sạch (Hộp 10 quả)', origin: 'VIỆT NAM', price: 45000, oldPrice: 55000, discount: 18, rating: 5, ratingCount: 156, soldCount: 5400, image: menuIcon7, hoverImage: menuIcon8 },
        { id: 44, name: 'Rau Muống Hữu Cơ (300g)', origin: 'VIỆT NAM', price: 15000, oldPrice: 20000, discount: 25, rating: 4, ratingCount: 25, soldCount: 1200, image: menu2Icon1, hoverImage: menu2Icon2 },
        { id: 45, name: 'Nấm Đùi Gà Tươi (200g)', origin: 'VIỆT NAM', price: 28000, oldPrice: 35000, discount: 20, rating: 4, ratingCount: 12, soldCount: 850, image: menu2Icon1, hoverImage: menu2Icon2 },
        { id: 46, name: 'Ba Chỉ Heo Tươi Sạch', origin: 'VIỆT NAM', price: 125000, oldPrice: 150000, discount: 16, rating: 5, ratingCount: 89, soldCount: 2300, image: menu2Icon3, hoverImage: menu2Icon4 },
        { id: 47, name: 'Sườn Non Heo Tươi', origin: 'VIỆT NAM', price: 185000, oldPrice: 220000, discount: 16, rating: 5, ratingCount: 45, soldCount: 1200, image: menu2Icon3, hoverImage: menu2Icon4 },
        { id: 48, name: 'Bí Đỏ Hồ Lô', origin: 'VIỆT NAM', price: 25000, oldPrice: 35000, discount: 28, rating: 4, ratingCount: 18, soldCount: 950, image: menu2Icon1, hoverImage: menu2Icon2 },
    ];

    const dryFoodProducts = [
        { id: 51, name: 'Gạo ST25 Thượng Hạng (5kg)', origin: 'VIỆT NAM', price: 195000, oldPrice: 220000, discount: 11, rating: 5, ratingCount: 230, soldCount: 12500, image: menu2Icon4, hoverImage: menu2Icon5 },
        { id: 52, name: 'Hạt Điều Rang Muối (500g)', origin: 'VIỆT NAM', price: 210000, oldPrice: 250000, discount: 16, rating: 5, ratingCount: 45, soldCount: 1240, image: menu2Icon6, hoverImage: menu2Icon5 },
        { id: 53, name: 'Mật Ong Hoa Nhãn Nguyên Chất', origin: 'VIỆT NAM', price: 185000, oldPrice: 220000, discount: 15, rating: 5, ratingCount: 67, soldCount: 780, image: menuIcon8, hoverImage: menuIcon7 },
        { id: 54, name: 'Yến Mạch Nguyên Cám', origin: 'ÚC', price: 125000, oldPrice: 150000, discount: 16, rating: 4, ratingCount: 34, soldCount: 950, image: menu2Icon4, hoverImage: menu2Icon5 },
        { id: 55, name: 'Hạt Macca Úc Nguyên Vỏ', origin: 'ÚC', price: 290000, oldPrice: 350000, discount: 17, rating: 5, ratingCount: 12, soldCount: 450, image: menu2Icon6, hoverImage: menu2Icon7 },
        { id: 56, name: 'Trà Xanh Thái Nguyên Đặc Biệt', origin: 'VIỆT NAM', price: 150000, oldPrice: 180000, discount: 16, rating: 5, ratingCount: 28, soldCount: 620, image: menu2Icon7, hoverImage: menu2Icon6 },
        { id: 57, name: 'Hạnh Nhân Rang Bơ', origin: 'MỸ', price: 245000, oldPrice: 290000, discount: 15, rating: 5, ratingCount: 12, soldCount: 320, image: menu2Icon6, hoverImage: menu2Icon5 },
        { id: 58, name: 'Nước Mắm Nhĩ Cá Cơm', origin: 'PHÚ QUỐC', price: 115000, oldPrice: 135000, discount: 15, rating: 5, ratingCount: 156, soldCount: 1200, image: menuIcon10, hoverImage: menuIcon9 },
    ];

    const organicFoodProducts = [
        { id: 61, name: 'Sữa Tươi Hữu Cơ Koita', origin: 'Ý', price: 65000, oldPrice: 75000, discount: 13, rating: 5, ratingCount: 15, soldCount: 890, image: menuIcon9, hoverImage: menu2Icon7 },
        { id: 62, name: 'Bột Gia Vị Hữu Cơ Organic', origin: 'ẤN ĐỘ', price: 125000, oldPrice: 150000, discount: 16, rating: 5, ratingCount: 8, soldCount: 320, image: menuIcon10, hoverImage: menuIcon9 },
        { id: 63, name: 'Quả Óc Chó Mỹ Hữu Cơ', origin: 'MỸ', price: 350000, oldPrice: 420000, discount: 16, rating: 5, ratingCount: 22, soldCount: 450, image: menu2Icon6, hoverImage: menu2Icon5 },
        { id: 64, name: 'Dầu Olive Extra Virgin Hữu Cơ', origin: 'TÂY BAN NHA', price: 285000, oldPrice: 320000, discount: 10, rating: 5, ratingCount: 14, soldCount: 230, image: menuIcon10, hoverImage: menuIcon9 },
        { id: 65, name: 'Kẹo Dẻo Hữu Cơ Cho Bé', origin: 'ĐỨC', price: 55000, oldPrice: 65000, discount: 15, rating: 5, ratingCount: 45, soldCount: 1100, image: menu2Icon5, hoverImage: menu2Icon10 },
        { id: 66, name: 'Gạo Lứt Hữu Cơ (2kg)', origin: 'VIỆT NAM', price: 110000, oldPrice: 130000, discount: 15, rating: 5, ratingCount: 56, soldCount: 1800, image: menu2Icon4, hoverImage: menu2Icon5 },
        { id: 67, name: 'Pasta Hữu Cơ Ý', origin: 'Ý', price: 85000, oldPrice: 105000, discount: 19, rating: 5, ratingCount: 12, soldCount: 450, image: menu2Icon5, hoverImage: menuIcon9 },
        { id: 68, name: 'Trà Thảo Mộc Hữu Cơ', origin: 'ĐỨC', price: 145000, oldPrice: 175000, discount: 17, rating: 5, ratingCount: 8, soldCount: 210, image: menu2Icon7, hoverImage: menuIcon10 },
    ];

    const treeGiftProducts = [
        { id: 71, name: 'Cây Kim Tiền Để Bàn', origin: 'VIỆT NAM', price: 150000, oldPrice: 180000, discount: 16, rating: 5, ratingCount: 34, soldCount: 450, image: menu2Icon8, hoverImage: menu2Icon9 },
        { id: 72, name: 'Cây Lưỡi Hổ May Mắn', origin: 'VIỆT NAM', price: 120000, oldPrice: 150000, discount: 20, rating: 5, ratingCount: 12, soldCount: 320, image: menu2Icon8, hoverImage: menu2Icon10 },
        { id: 73, name: 'Set 3 Cây Sen Đá Mini', origin: 'VIỆT NAM', price: 95000, oldPrice: 120000, discount: 21, rating: 5, ratingCount: 56, soldCount: 890, image: menu2Icon8, hoverImage: menuIcon7 },
        { id: 74, name: 'Chậu Cây Lan Ý Thủy Sinh', origin: 'VIỆT NAM', price: 185000, oldPrice: 220000, discount: 15, rating: 4, ratingCount: 8, soldCount: 150, image: menu2Icon8, hoverImage: menu2Icon10 },
        { id: 75, name: 'Cây Hạnh Phúc Đại', origin: 'VIỆT NAM', price: 550000, oldPrice: 650000, discount: 15, rating: 5, ratingCount: 5, soldCount: 45, image: menu2Icon8, hoverImage: menu2Icon9 },
        { id: 76, name: 'Tiểu Cảnh Sen Đá', origin: 'VIỆT NAM', price: 350000, oldPrice: 400000, discount: 12, rating: 5, ratingCount: 18, soldCount: 67, image: menu2Icon8, hoverImage: menuIcon6 },
        { id: 77, name: 'Cây Tuyết Tùng Mini', origin: 'VIỆT NAM', price: 220000, oldPrice: 260000, discount: 15, rating: 5, ratingCount: 12, soldCount: 34, image: menu2Icon8, hoverImage: menu2Icon9 },
        { id: 78, name: 'Cây Bàng Singapore', origin: 'VIỆT NAM', price: 450000, oldPrice: 520000, discount: 13, rating: 5, ratingCount: 6, soldCount: 15, image: menu2Icon8, hoverImage: menu2Icon10 },
    ];

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

