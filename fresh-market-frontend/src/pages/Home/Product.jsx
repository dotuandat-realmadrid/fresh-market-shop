import React, { useState } from 'react';
import { FaFilter, FaChevronDown, FaSortAlphaDown, FaCheck, FaTimes, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import './Product.css';
import ProductCard from '../../components/ProductCard';

// Import assets
import cherryIcon from '../../assets/images/img_item_category_home_4_medium.png';
import durianIcon from '../../assets/images/img_item_category_home_5_medium.png';
import cutFruitIcon from '../../assets/images/img_item_category_home_13_medium.png';
import boxFruitIcon from '../../assets/images/img_item_category_home_3_medium.png';

// Mock data
import productImg1 from '../../assets/images/menu2_icon_9.jpg';
import productHoverImg1 from '../../assets/images/img_item_category_home_1_medium.png';

const Product = () => {
    const [selectedCategory, setSelectedCategory] = useState(0);
    const [selectedChip, setSelectedChip] = useState(0);
    const [selectedPrices, setSelectedPrices] = useState([]);
    const [selectedSort, setSelectedSort] = useState('Sản phẩm nổi bật');
    const [currentPage, setCurrentPage] = useState(1);

    const categories = [
        { id: 0, title: 'Trái Cây Nhập Khẩu', icon: cherryIcon },
        { id: 1, title: 'Trái Cây Việt Nam', icon: durianIcon },
        { id: 2, title: 'Trái Cây Cắt Sẵn', icon: cutFruitIcon },
        { id: 3, title: 'Trái Cây Thùng', icon: boxFruitIcon },
    ];

    const filterChips = [
        'Nho Nhập Khẩu',
        'Dâu Tây & Các Loại Berry Nhập Khẩu',
        'Táo Envy',
        'Trái Cây Hữu Cơ',
        'Kiwi Nhập Khẩu',
        'Mận Nhập Khẩu',
        'Táo Nhập Khẩu',
        'Cherry Nhập Khẩu (Hết Mùa)'
    ];

    const priceFilters = [
        'Dưới 500.000₫',
        '500.000₫ - 1.000.000₫',
        '1.000.000₫ - 2.000.000₫',
        '2.000.000₫ - 3.000.000₫',
        'Trên 3.000.000₫'
    ];

    const sortOptions = [
        'Sản phẩm nổi bật',
        'Giá: Tăng dần',
        'Giá: Giảm dần',
        'Tên: A-Z',
        'Tên: Z-A',
        'Cũ nhất',
        'Mới nhất',
        'Bán chạy nhất',
        'Tồn kho giảm dần'
    ];

    const togglePriceFilter = (price) => {
        setSelectedPrices(prev => 
            prev.includes(price) ? prev.filter(p => p !== price) : [...prev, price]
        );
    };

    // Fill with 18 products to show 3 rows (6 columns each)
    const products = Array.from({ length: 18 }, (_, i) => ({
        id: i + 1,
        name: i === 0 ? 'Dâu Hàn Quốc 250g (I0004758)' : `Sản phẩm mẫu ${i + 1}`,
        origin: i === 0 ? 'HÀN QUỐC' : 'VIỆT NAM',
        price: 159000 + (i * 10000),
        oldPrice: 199000 + (i * 10000),
        discount: 20,
        rating: 4,
        ratingCount: 10 + i,
        soldCount: 1000 + (i * 50),
        isFlashSale: i < 3,
        image: productImg1,
        hoverImage: productHoverImg1
    }));

    return (
        <div className="product-page-container">
            {/* 1. Category Cards */}
            <div className="product-category-cards">
                {categories.map((cat, idx) => (
                    <div 
                        key={cat.id} 
                        className={`category-card ${selectedCategory === idx ? 'active' : ''}`}
                        onClick={() => setSelectedCategory(idx)}
                    >
                        <div className="category-card-icon">
                            <img src={cat.icon} alt={cat.title} />
                        </div>
                        <span className="category-card-title">{cat.title}</span>
                    </div>
                ))}
            </div>

            {/* 2. Filter Chips */}
            <div className="filter-chips-section">
                {filterChips.map((chip, idx) => (
                    <div 
                        key={idx} 
                        className={`filter-chip ${selectedChip === idx ? 'active' : ''}`}
                        onClick={() => setSelectedChip(idx)}
                    >
                        {chip}
                    </div>
                ))}
            </div>

            {/* 3. Filter Toolbar */}
            <div className="filter-toolbar-wrapper">
                <div className="filter-toolbar">
                    <div className="filter-label">
                        <FaFilter size={14} /> BỘ LỌC
                    </div>
                    <div className="custom-dropdown">
                        <div className="dropdown-header">
                            Lọc giá <FaChevronDown className="dropdown-arrow" />
                        </div>
                        <div className="dropdown-content">
                            {priceFilters.map((price, idx) => (
                                <div 
                                    key={idx} 
                                    className={`price-filter-item ${selectedPrices.includes(price) ? 'active' : ''}`}
                                    onClick={() => togglePriceFilter(price)}
                                >
                                    <div className="custom-checkbox">
                                        <FaCheck className="check-icon" />
                                    </div>
                                    <span className="price-text">{price}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Filter Tags */}
                {selectedPrices.length > 0 && (
                    <div className="active-filters-tags">
                        <div className="filter-tag">
                            <span className="tag-label">Lọc giá: </span>
                            <span className="tag-value">{priceFilters.filter(p => selectedPrices.includes(p)).join(', ')}</span>
                            <div className="remove-tag" onClick={() => setSelectedPrices([])}>
                                <FaTimes size={14} style={{ marginLeft: '10px' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Page Title and Sorting */}
            <div className="page-title-sort">
                <h1 className="page-main-title">Trái Cây Nhập</h1>
                <div className="sort-container">
                    <div className="custom-dropdown" style={{ width: '200px' }}>
                        <div className="dropdown-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaSortAlphaDown size={14} /> Sắp xếp
                            </div>
                            <FaChevronDown className="dropdown-arrow" />
                        </div>
                        <div className="dropdown-content">
                            {sortOptions.map((option, idx) => (
                                <div 
                                    key={idx} 
                                    className={`sort-item ${selectedSort === option ? 'active' : ''}`}
                                    onClick={() => setSelectedSort(option)}
                                >
                                    <FaCheck className="tick-icon" />
                                    <span>{option}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Product Grid (Display 18 items for exactly 3 rows) */}
            <div className="product-list-grid">
                {products.map(product => (
                    <ProductCard key={product.id} product={product} />
                ))}
            </div>

            {/* 6. Pagination (Bottom Center) */}
            <div className="pagination-wrapper">
                <div className="pagination-container">
                    <button className="page-btn disabled" title="Trang trước"><FaAngleLeft /></button>
                    <button className="page-btn active">1</button>
                    <button className="page-btn" onClick={() => setCurrentPage(2)}>2</button>
                    <button className="page-btn" onClick={() => setCurrentPage(3)}>3</button>
                    <button className="page-btn" title="Trang sau"><FaAngleRight /></button>
                </div>
            </div>
        </div>
    );
};

export default Product;
