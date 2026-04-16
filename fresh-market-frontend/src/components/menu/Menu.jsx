import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { getCategoryTree } from '../../api/category';
import { IMAGE_URL_FRONTEND } from '../../api/auth';
const icon1 = '/images/icon-1.png';
import './Menu.css';

const Menu = ({ onHoverChange, headerHeight = 0, isMobileOpen, onClose }) => {
  const [menuItems, setMenuItems] = useState([]);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [expandedSubItems, setExpandedSubItems] = useState({}); // Lưu trạng thái "Xem thêm" theo từng sub-item
  const leaveTimer = useRef(null);
  const location = useLocation();

  // Reset menu khi chuyển trang
  useEffect(() => {
    setHoveredIndex(null);
    setExpandedSubItems({});
    if (onHoverChange) onHoverChange(false);
  }, [location.pathname]);

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const data = await getCategoryTree();
        if (data) {
          const formattedData = data.map(cat => ({
            title: cat.name,
            icon: cat.imagePath ? `${IMAGE_URL_FRONTEND}/${cat.imagePath}` : '/images/no_image_large.jpg',
            path: `/collections/${cat.code}`,
            children: cat.children.map(subCat => ({
              title: subCat.name,
              img: subCat.imagePath ? `${IMAGE_URL_FRONTEND}/${subCat.imagePath}` : '/images/no_image_large.jpg',
              path: `/collections/${subCat.code}`,
              items: subCat.children.map(item => ({ name: item.name, code: item.code }))
            }))
          }));
          setMenuItems(formattedData);
        }
      } catch (error) {
        console.error("Failed to fetch menu items:", error);
      }
    };
    fetchMenu();
  }, []);

  const handleContainerMouseEnter = () => {
    if (leaveTimer.current) clearTimeout(leaveTimer.current);
    if (onHoverChange) onHoverChange(true);
  };

  const handleContainerMouseLeave = () => {
    leaveTimer.current = setTimeout(() => {
      setHoveredIndex(null);
      setExpandedSubItems({}); // Reset trạng thái khi rời menu
      if (onHoverChange) onHoverChange(false);
    }, 100);
  };

  const toggleExpand = (subTitle) => {
    setExpandedSubItems(prev => ({
      ...prev,
      [subTitle]: !prev[subTitle]
    }));
  };

  const getSlug = (text) => {
    if (!text) return "";
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/([^0-9a-z-\s])/g, "")
      .replace(/(\s+)/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  const activeItem = hoveredIndex !== null ? menuItems[hoveredIndex] : null;

  return (
    <div
      className="menu-wrapper"
      onMouseEnter={handleContainerMouseEnter}
      onMouseLeave={handleContainerMouseLeave}
    >
      {/* Sidebar menu chính */}
      <div className="menu-container d-flex flex-column bg-white h-100 border-end">
        <div className="menu-logo-section py-5 px-2 border-bottom d-flex align-items-center justify-content-center bg-light">
          <div className="d-flex align-items-center gap-2">
            <img src={icon1} alt="Fresh Market Icon" style={{ height: '38px', objectFit: 'contain' }} />
            <div className="d-flex flex-column" style={{ lineHeight: '1.1' }}>
              <span style={{ color: '#004aad', fontSize: '22px', fontWeight: '900', letterSpacing: '0.5px' }}>BICH THUY</span>
              <span style={{ color: '#ff6600', fontSize: '12px', fontWeight: '700', letterSpacing: '1.5px', paddingLeft: '2px' }}>MARKET</span>
            </div>
          </div>
        </div>

        <div className="menu-all-products px-3 py-2 border-bottom d-flex align-items-center gap-2">
          <div className="all-products-icon text-primary flex-shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </div>
          <div className="d-flex flex-column text-start">
            <span className="fw-bold" style={{ fontSize: '14px', color: '#004aad' }}>Tất cả sản phẩm</span>
            <span className="text-uppercase" style={{ fontSize: '11px', color: '#888', letterSpacing: '0.5px' }}>BICH THUY MARKET</span>
          </div>
        </div>

        <div className="menu-categories flex-grow-1 overflow-auto">
          {/* Header mobile title */}
          <div className="d-lg-none px-3 py-3 border-bottom d-flex align-items-center justify-content-between bg-light">
            <span className="fw-bold" style={{ color: '#004aad' }}>Danh mục sản phẩm</span>
            <button className="btn-close" onClick={onClose}></button>
          </div>
          <ul className="list-unstyled mb-0">
            {menuItems.map((item, index) => (
              <li
                key={index}
                className={`menu-item ${hoveredIndex === index ? 'active-hover' : ''}`}
                onMouseEnter={() => !isMobileOpen && setHoveredIndex(index)}
                onClick={() => isMobileOpen && setHoveredIndex(index)}
              >
                <Link 
                  to={item.path} 
                  className="px-3 py-2 d-flex align-items-center gap-2 cursor-pointer text-dark text-decoration-none w-100 h-100"
                  onClick={(e) => {
                    if (isMobileOpen && item.children.length > 0) {
                      e.preventDefault();
                    }
                  }}
                >
                  <span className="menu-item-icon flex-shrink-0" style={{ width: '26px', height: '26px' }}>
                    <img src={item.icon} alt={item.title} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                  </span>
                  <span className="menu-item-text" style={{ fontSize: '13.5px', color: '#222', fontWeight: '500', lineHeight: '1.3' }}>
                    {item.title}
                  </span>
                  {item.children.length > 0 && (
                    <span className="ms-auto text-muted" style={{ fontSize: '10px' }}>›</span>
                  )}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Sub-menu (mega menu) */}
      {activeItem && activeItem.children.length > 0 && (
        <div className="mega-menu-panel bg-white" style={{ top: 0, height: '100vh' }}>
          <div className="mega-menu-header px-3 py-3 border-bottom d-flex align-items-center gap-3">
            <div className="d-lg-none cursor-pointer" onClick={() => setHoveredIndex(null)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12"></line>
                <polyline points="12 19 5 12 12 5"></polyline>
              </svg>
            </div>
            <Link to={activeItem.path} className="text-decoration-none" onClick={() => { if (isMobileOpen) { onClose(); setHoveredIndex(null); } }}>
              <h6 className="mb-0 fw-bold" style={{ color: '#004aad', fontSize: '15px' }}>
                {activeItem.title}
              </h6>
            </Link>
            {isMobileOpen && (
              <button className="btn-close ms-auto d-lg-none" onClick={onClose}></button>
            )}
          </div>

          <div className="mega-menu-grid p-3">
            {activeItem.children.map((sub, i) => {
              const isExpanded = expandedSubItems[sub.title];
              const displayItems = sub.items ? (isExpanded ? sub.items : sub.items.slice(0, 4)) : [];
              const hasMore = sub.items && sub.items.length > 4;
              const subPath = sub.path || `${activeItem.path}/${getSlug(sub.title)}`;

              return (
                <div key={i} className="sub-item text-start align-items-start d-flex flex-column" style={{ paddingBottom: '20px' }}>
                  <Link to={subPath} className="text-decoration-none text-dark w-100" onClick={() => { if (isMobileOpen) { onClose(); setHoveredIndex(null); } }}>
                    <div className="sub-item-img-wrap mb-2">
                      <img src={sub.img} alt={sub.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                    <div className="sub-item-title fw-bold text-dark">
                      {sub.title}
                    </div>
                  </Link>

                  {displayItems.length > 0 && (
                    <ul className="sub-item-product-list">
                      {displayItems.map((item, idx) => (
                        <li key={idx} title={item.name}>
                          <Link 
                            to={`/collections/${item.code}`} 
                            className="product-link"
                            onClick={() => { if (isMobileOpen) { onClose(); setHoveredIndex(null); } }}
                          >
                            {item.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}

                  {hasMore && !isExpanded && (
                    <span
                      className="view-more-btn cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        toggleExpand(sub.title);
                      }}
                    >
                      Xem thêm
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default Menu;
