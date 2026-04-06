import React, { useState, useEffect, useCallback } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import { Empty, Skeleton } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import './Search.css';
import ProductCard from '../../components/ProductCard';
import CustomPagination from '../../components/CustomPagination/CustomPagination';
import { searchProducts } from '../../api/product';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';

const Search = () => {
    const location = useLocation();
    const navigate = useNavigate();
    
    // Get query param 'q' from URL
    const queryParams = new URLSearchParams(location.search);
    const searchQuery = queryParams.get('q') || '';
    
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalElements, setTotalElements] = useState(0);
    const PAGE_SIZE = 18;

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

    const fetchSearchResults = useCallback(async (query, page) => {
        try {
            setLoading(true);
            const filters = { name: query };
            const response = await searchProducts(filters, page, PAGE_SIZE);
            
            if (response && response.data) {
                setProducts(response.data.map(mapProductResponse));
                setTotalPages(response.totalPage || 1);
                setTotalElements(response.totalElements || 0);
            } else {
                setProducts([]);
                setTotalPages(1);
                setTotalElements(0);
            }
        } catch (error) {
            console.error("Error fetching search results:", error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        setCurrentPage(1);
        fetchSearchResults(searchQuery, 1);
    }, [searchQuery, fetchSearchResults]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchSearchResults(searchQuery, page);
        window.scrollTo(0, 0);
    };

    return (
        <div className="search-page-container">
            {/* 1. Breadcrumb */}
            <nav className="search-breadcrumb">
                <Link to="/" className="search-bc-link">Trang chủ</Link>
                <span className="search-bc-sep">/</span>
                <span className="search-bc-current">Tìm kiếm</span>
            </nav>

            {/* 2. Page Header */}
            <div className="search-header">
                <h1 className="search-main-title">Tìm kiếm</h1>
                <span className="search-count-info">
                   Có <strong>{totalElements} sản phẩm</strong> cho tìm kiếm
                </span>
                <div className="search-title-line"></div>
            </div>

            {/* 3. Search Results Subtitle */}
            <div className="search-query-result">
                Kết quả tìm kiếm cho <strong>"{searchQuery}"</strong>.
            </div>

            {/* 4. Results Section */}
            {loading ? (
                <div className="search-product-grid">
                    {[...Array(PAGE_SIZE)].map((_, i) => (
                        <div key={i} className="search-skeleton-item">
                            <Skeleton active avatar={{ shape: 'square', size: 'large' }} paragraph={{ rows: 3 }} />
                        </div>
                    ))}
                </div>
            ) : products.length > 0 ? (
                <>
                    <div className="search-product-grid">
                        {products.map(product => (
                            <ProductCard key={product.id || product.code} product={product} />
                        ))}
                    </div>

                    {/* 5. Pagination */}
                    {totalPages > 1 && (
                        <div className="search-pagination-wrapper">
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
            ) : (
                <div className="no-results-container">
                    <Empty 
                        image={<InboxOutlined style={{ fontSize: '80px', color: '#ccc' }} />}
                        description={
                            <span style={{ color: '#000', fontSize: '16px' }}>
                                Rất tiếc, chúng tôi không tìm thấy kết quả cho "{searchQuery}"
                            </span>
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default Search;
