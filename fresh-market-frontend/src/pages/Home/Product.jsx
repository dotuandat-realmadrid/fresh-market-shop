import React, { useState, useEffect } from 'react';
import { Empty, Skeleton } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { FaFilter, FaChevronDown, FaSortAlphaDown, FaCheck, FaTimes, FaAngleLeft, FaAngleRight } from 'react-icons/fa';
import './Product.css';
import ProductCard from '../../components/ProductCard';
import CustomPagination from '../../components/CustomPagination/CustomPagination';
import { getCategoryByCode } from '../../api/category';
import { searchProducts } from '../../api/product';
import { getWishListByUser } from '../../api/wishList';
import { IMAGE_URL, IMAGE_URL_FRONTEND, DEFAULT_IMAGE } from '../../api/auth';
import { getToken } from '../../services/localStorageService';

const Product = () => {
    const { category: urlCategoryCode } = useParams();
    const navigate = useNavigate();
    const userId = useSelector(state => state.user.id);

    const [categoryData, setCategoryData] = useState(null);
    const [categoryCards, setCategoryCards] = useState([]);
    const [filterChips, setFilterChips] = useState([]);
    const [activeCardCode, setActiveCardCode] = useState(null);
    const [activeChipCode, setActiveChipCode] = useState(null);

    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [productCategoryCodes, setProductCategoryCodes] = useState([]);
    
    const [selectedPrices, setSelectedPrices] = useState(null);
    const [selectedSort, setSelectedSort] = useState('Sản phẩm nổi bật');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);

    const PAGE_SIZE = 18;

    const priceFilters = [
        { label: 'Dưới 500.000₫',           minPrice: null,    maxPrice: 500000 },
        { label: '500.000₫ - 1.000.000₫',   minPrice: 500000,  maxPrice: 1000000 },
        { label: '1.000.000₫ - 2.000.000₫', minPrice: 1000000, maxPrice: 2000000 },
        { label: '2.000.000₫ - 3.000.000₫', minPrice: 2000000, maxPrice: 3000000 },
        { label: 'Trên 3.000.000₫',          minPrice: 3000000, maxPrice: null },
    ];

    const sortOptions = [
        { label: 'Sản phẩm nổi bật', sortBy: null,                direction: null },
        { label: 'Giá: Tăng dần',    sortBy: 'price',             direction: 'ASC' },
        { label: 'Giá: Giảm dần',    sortBy: 'price',             direction: 'DESC' },
        { label: 'Tên: A-Z',         sortBy: 'name',              direction: 'ASC' },
        { label: 'Tên: Z-A',         sortBy: 'name',              direction: 'DESC' },
        { label: 'Cũ nhất',          sortBy: 'createdDate',       direction: 'ASC' },
        { label: 'Mới nhất',         sortBy: 'createdDate',       direction: 'DESC' },
        { label: 'Bán chạy nhất',    sortBy: 'soldQuantity',      direction: 'DESC' },
        { label: 'Tồn kho giảm dần', sortBy: 'inventoryQuantity', direction: 'DESC' },
    ];

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

    // Hàm fetch products dùng chung, nhận thẳng codes để tránh stale state
    const fetchProductsByCodes = async (codes, page = 1, sort = selectedSort, priceLabel = selectedPrices) => {
        try {
            if (urlCategoryCode === 'wish-list') {
                if (getToken() && userId) {
                    const res = await getWishListByUser(userId, page, PAGE_SIZE);
                    if (res) {
                        const items = res.data || res || [];
                        setProducts(items.map(mapProductResponse));
                        setTotalPages(res.totalPage || 1);
                        setTotalElements(res.totalElements || items.length);
                    }
                } else {
                    const guestWishlist = JSON.parse(localStorage.getItem('guestWishlist')) || {};
                    const items = Object.values(guestWishlist);
                    setProducts(items); 
                    setTotalPages(1);
                    setTotalElements(items.length);
                }
                return;
            }

            const activePriceFilter = priceFilters.find(p => priceLabel === p.label);
            const minPrice = activePriceFilter?.minPrice ?? null;
            const maxPrice = activePriceFilter?.maxPrice ?? null;

            const activeSortOption = sortOptions.find(s => s.label === sort);
            const sortBy    = activeSortOption?.sortBy    ?? null;
            const direction = activeSortOption?.direction ?? null;

            const filters = { categoryCodes: codes };
            if (minPrice !== null) filters.minPrice = minPrice;
            if (maxPrice !== null) filters.maxPrice = maxPrice;
            if (sortBy)    filters.sortBy    = sortBy;
            if (direction) filters.direction = direction;

            const response = await searchProducts(filters, page, PAGE_SIZE);
            if (response && response.data) {
                setProducts(response.data.map(mapProductResponse));
                setTotalPages(response.totalPage || 1);
                setTotalElements(response.totalElements || 0);
            }
        } catch (error) {
            console.error("Error fetching products:", error);
        }
    };

    const fetchAllDescendantCodes = async (node) => {
        let codes = [node.code];
        if (node.children && node.children.length > 0) {
            await Promise.all(node.children.map(async (child) => {
                let childData = child;
                
                // Tính level con: dùng level trả về hoặc tự tính dựa trên cha
                const childLevel = child.level || (node.level ? node.level + 1 : 1);
                
                // Chỉ gọi API nạp thêm dữ liệu nếu chưa tới mức 3 (tức là mức 1, 2)
                if (childLevel < 3 && (!child.children || child.children.length === 0)) {
                    try {
                        const res = await getCategoryByCode(child.code);
                        if (res) {
                            childData = res;
                            childData.level = childLevel; // Đảm bảo gán level để dùng cho nhánh đệ quy tiếp theo
                        }
                    } catch (e) {}
                }
                const descendantCodes = await fetchAllDescendantCodes(childData);
                codes = codes.concat(descendantCodes);
            }));
        }
        return Array.from(new Set(codes)); 
    };

    useEffect(() => {
        const fetchCategoryHierarchy = async () => {
            try {
                setLoading(true);

                if (urlCategoryCode === 'wish-list') {
                    setCategoryData({ name: 'Sản phẩm yêu thích', code: 'wish-list' });
                    setCategoryCards([]);
                    setFilterChips([]);
                    setActiveCardCode(null);
                    setActiveChipCode(null);
                    setProductCategoryCodes(['wish-list']);
                    await fetchProductsByCodes(['wish-list']);
                    return;
                }

                const currentCat = await getCategoryByCode(urlCategoryCode);
                setCategoryData(currentCat);

                if (currentCat.level === 1) {
                    // ---- UI: cards = children level 2, không active cái nào ----
                    setCategoryCards(currentCat.children || []);
                    setFilterChips([]);
                    setActiveCardCode(null);
                    setActiveChipCode(null);

                    // ---- Product codes: Lấy đệ quy toàn bộ danh mục con/cháu ----
                    const codes = await fetchAllDescendantCodes(currentCat);
                    setProductCategoryCodes(codes);
                    await fetchProductsByCodes(codes);

                } else if (currentCat.level === 2) {
                    // ---- UI: chips = children level3, cards = anh em level2 ----
                    setFilterChips(currentCat.children || []);
                    setActiveChipCode(null);

                    // ---- Product codes: Lấy đệ quy toàn bộ con/cháu của level 2 ----
                    const codes = await fetchAllDescendantCodes(currentCat);
                    setProductCategoryCodes(codes);
                    await fetchProductsByCodes(codes);

                    // Fetch parent để lấy danh sách anh em cho cards
                    if (currentCat.parents && currentCat.parents.length > 0) {
                        const parentCat = await getCategoryByCode(currentCat.parents[0]);
                        setCategoryCards(parentCat.children || []);
                        setActiveCardCode(urlCategoryCode);
                    } else {
                        setCategoryCards([]);
                        setActiveCardCode(null);
                    }

                } else if (currentCat.level === 3) {
                    // ---- Level 3: chỉ dùng code chính nó (nếu có con thì vẫn lấy đệ quy) ----
                    setActiveChipCode(urlCategoryCode);
                    setActiveCardCode(null);
                    
                    const codes = await fetchAllDescendantCodes(currentCat);
                    setProductCategoryCodes(codes);
                    await fetchProductsByCodes(codes);

                    // Fetch parent (level2) để lấy chips
                    if (currentCat.parents && currentCat.parents.length > 0) {
                        const parentCat = await getCategoryByCode(currentCat.parents[0]);
                        setFilterChips(parentCat.children || []);

                        // Fetch grandparent (level1) để lấy cards
                        if (parentCat.parents && parentCat.parents.length > 0) {
                            const grandParentCat = await getCategoryByCode(parentCat.parents[0]);
                            setCategoryCards(grandParentCat.children || []);
                        } else {
                            setCategoryCards([]);
                        }
                    } else {
                        setFilterChips([]);
                        setCategoryCards([]);
                    }
                }
            } catch (error) {
                console.error("Error fetching category hierarchy:", error);
            } finally {
                setLoading(false);
            }
        };

        if (urlCategoryCode) {
            setCurrentPage(1);
            setProducts([]);
            fetchCategoryHierarchy();
        }
    }, [urlCategoryCode]);

    // useEffect riêng: re-fetch products khi sort/price/page thay đổi
    useEffect(() => {
        if (!productCategoryCodes || productCategoryCodes.length === 0) return;
        setLoading(true);
        fetchProductsByCodes(productCategoryCodes, currentPage, selectedSort, selectedPrices)
            .finally(() => setLoading(false));
    }, [currentPage, selectedSort, selectedPrices]);

    // Lắng nghe sự kiện cập nhật wishlist để đồng bộ khi đang ở trang wish-list
    useEffect(() => {
        const handleWishlistSync = () => {
            if (urlCategoryCode === 'wish-list') {
                fetchProductsByCodes(['wish-list'], currentPage, selectedSort, selectedPrices);
            }
        };

        window.addEventListener('wishlistUpdated', handleWishlistSync);
        return () => window.removeEventListener('wishlistUpdated', handleWishlistSync);
    }, [urlCategoryCode, currentPage, selectedSort, selectedPrices]);

    const handleCategoryClick = (code) => {
        navigate(`/collections/${code}`);
    };

    const togglePriceFilter = (label) => {
        // Single-select: toggle off if already selected, else select new one
        setSelectedPrices(prev => prev === label ? null : label);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages) {
            setCurrentPage(page);
            window.scrollTo(0, 0);
        }
    };

    return (
        <div className="product-page-container">
            {/* 1. Category Cards */}
            {categoryCards.length > 0 && (
                <div className="product-category-cards">
                    {categoryCards.map((cat) => (
                        <div 
                            key={cat.code} 
                            className={`category-card ${activeCardCode === cat.code ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(cat.code)}
                        >
                            <div className="category-card-icon">
                                <img src={cat.imagePath ? `${IMAGE_URL_FRONTEND}/${cat.imagePath}` : DEFAULT_IMAGE} alt={cat.name} />
                            </div>
                            <span className="category-card-title">{cat.name}</span>
                        </div>
                    ))}
                </div>
            )}

            {/* 2. Filter Chips */}
            {filterChips.length > 0 && (
                <div className="filter-chips-section">
                    {filterChips.map((chip) => (
                        <div 
                            key={chip.code} 
                            className={`filter-chip ${activeChipCode === chip.code ? 'active' : ''}`}
                            onClick={() => handleCategoryClick(chip.code)}
                        >
                            {chip.name}
                        </div>
                    ))}
                </div>
            )}

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
                            {priceFilters.map((price) => (
                                <div 
                                    key={price.label} 
                                    className={`price-filter-item ${selectedPrices === price.label ? 'active' : ''}`}
                                    onClick={() => togglePriceFilter(price.label)}
                                >
                                    <div className="custom-checkbox">
                                        <FaCheck className="check-icon" />
                                    </div>
                                    <span className="price-text">{price.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Active Filter Tags */}
                {selectedPrices && (
                    <div className="active-filters-tags">
                        <div className="filter-tag">
                            <span className="tag-label">Lọc giá: </span>
                            <span className="tag-value">{selectedPrices}</span>
                            <div className="remove-tag" onClick={() => setSelectedPrices(null)}>
                                <FaTimes size={14} style={{ marginLeft: '10px' }} />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* 4. Page Title and Sorting */}
            <div className="page-title-sort">
                <h1 className="page-main-title">{categoryData?.name}</h1>
                <div className="sort-container">
                    <div className="custom-dropdown" style={{ width: '200px' }}>
                        <div className="dropdown-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                <FaSortAlphaDown size={14} /> Sắp xếp
                            </div>
                            <FaChevronDown className="dropdown-arrow" />
                        </div>
                        <div className="dropdown-content">
                            {sortOptions.map((option) => (
                                <div 
                                    key={option.label} 
                                    className={`sort-item ${selectedSort === option.label ? 'active' : ''}`}
                                    onClick={() => { setSelectedSort(option.label); setCurrentPage(1); }}
                                >
                                    <FaCheck className="tick-icon" />
                                    <span>{option.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* 5. Product Grid & Pagination */}
            {products.length > 0 ? (
                <>
                    <div className="product-list-grid">
                        {products.map(product => (
                            <ProductCard key={product.id || product.code} product={product} />
                        ))}
                    </div>

                    {/* 6. Pagination */}
                    {totalPages > 1 && (
                        <div className="pagination-wrapper">
                            <CustomPagination 
                                current={currentPage} 
                                pageSize={PAGE_SIZE} 
                                total={totalElements} 
                                onChange={handlePageChange} 
                                layout="center" 
                            />
                        </div>
                    )}
                </>
            ) : loading ? (
                <div className="product-list-grid">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} style={{ background: '#fff', padding: '20px', borderRadius: '12px', border: '1px solid #eee' }}>
                            <Skeleton active avatar={{ shape: 'square', size: 'large' }} paragraph={{ rows: 3 }} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="no-products">
                    <Empty 
                        image={<InboxOutlined style={{ fontSize: '80px', color: '#ccc' }} />}
                        styles={{ image: { height: '80px', marginBottom: '0' } }}
                        description={
                            <span style={{ color: '#000', fontSize: '16px' }}>
                                Không có sản phẩm nào trong danh mục này!
                            </span>
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default Product;
