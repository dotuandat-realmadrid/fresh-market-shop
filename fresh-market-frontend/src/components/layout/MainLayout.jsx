import React, { useState, useRef, useEffect } from 'react';
import Header from '../header/Header';
import Footer from '../footer/Footer';
import Menu from '../menu/Menu';
import { Outlet } from 'react-router-dom';
import ScrollToTopButton from '../ScrollToTopButton';
import ContactButton from '../ContactButton';

const MainLayout = () => {
  const [isMenuHovered, setIsMenuHovered] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [headerHeight, setHeaderHeight] = useState(0);
  const headerRef = useRef(null);

  // Đo chiều cao header để mega menu panel bắt đầu từ dưới header
  useEffect(() => {
    const updateHeaderHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeaderHeight();
    window.addEventListener('resize', updateHeaderHeight);
    return () => window.removeEventListener('resize', updateHeaderHeight);
  }, []);

  return (
    <div className="w-100">
      {/* =====================================================
          Header: khi menu không hover → header đè lên menu (z 1030 > 1020)
                  khi menu hover      → menu đè lên header (z 1040 > 1025)
         ===================================================== */}
      <div
        ref={headerRef}
        className="position-relative bg-white"
        style={{ zIndex: (isMenuHovered || isMobileMenuOpen) ? 1025 : 1030 }}
      >
        <Header onMenuToggle={() => setIsMobileMenuOpen(!isMobileMenuOpen)} />
      </div>

      <div className="d-flex w-100">
        {/* =====================================================
            Menu: Luôn cao 100vh, cố định ở top 0
           ===================================================== */}
        <div
          className={`layout-menu-wrapper bg-white position-fixed start-0 ${isMobileMenuOpen ? 'mobile-menu-open' : ''}`}
          style={{
            top: 0,
            height: '100vh',
            zIndex: (isMenuHovered || isMobileMenuOpen) ? 1040 : 1020,
          }}
        >
          <Menu 
            onHoverChange={setIsMenuHovered} 
            headerHeight={headerHeight} 
            isMenuHovered={isMenuHovered} 
            isMobileOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          />
        </div>

        {/* =====================================================
            Overlay tối phủ lên header + main khi hover menu
            Pointer-events none để không chặn mouse event
           ===================================================== */}
        {(isMenuHovered || isMobileMenuOpen) && (
          <div
            className="menu-overlay"
            onClick={() => setIsMobileMenuOpen(false)}
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100vw',
              height: '100vh',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              zIndex: 1035,
              pointerEvents: isMobileMenuOpen ? 'auto' : 'none',
            }}
          />
        )}

        {/* Cột 2: Main + Footer */}
        <div className="layout-main-wrapper d-flex flex-column">
          <main className="flex-grow-1" style={{ backgroundColor: '#fff', minHeight: '100vh' }}>
            <Outlet />
          </main>
          <Footer />
        </div>
      </div>
      <ScrollToTopButton />
      <ContactButton />
    </div>
  );
};

export default MainLayout;
