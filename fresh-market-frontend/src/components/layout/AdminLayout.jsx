import { Badge, Layout, Menu, theme } from "antd";
import { Content } from "antd/es/layout/layout";
import { useEffect, useState } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import AdminHeader from "../header/AdminHeader";
import ScrollToTopButton from "../ScrollToTopButton";
import { hasPermission } from "../../services/authService";
import {
  HomeOutlined,
  UserOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  CalendarOutlined,
  InboxOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  TagsOutlined,
  InfoCircleOutlined,
  EnvironmentOutlined,
  BankOutlined,
  GlobalOutlined,
  TabletOutlined,
  DesktopOutlined,
  MonitorOutlined,
  CommentOutlined,
  MobileOutlined,
  TeamOutlined,
  SettingOutlined,
  HistoryOutlined,
} from "@ant-design/icons";

const { Sider } = Layout;

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(window.innerWidth <= 992);
  const [openKeys, setOpenKeys] = useState([]);
  const location = useLocation();
  const navigate = useNavigate();

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  // Hàm tạo menu item
  function getItem(label, key, icon, count = 0, children) {
    const labelWithBadge =
      count > 0 ? (
        <span>
          {label} <Badge size="small" count={count} style={{ marginLeft: 8 }} />
        </span>
      ) : (
        label
      );

    return {
      key,
      icon,
      children,
      label: labelWithBadge,
    };
  }

  // Cấu hình menu items - Calculate once to avoid re-running hasPermission on every render
  const [items, setItems] = useState([]);

  useEffect(() => {
    const isAdminOrUser = hasPermission(["ADMIN", "USER"]);
    
    const menuItems = [
      ...(isAdminOrUser ? [getItem("Tổng Quát", "/admin", <HomeOutlined />)] : []),
      ...(isAdminOrUser ? [getItem("Quản Lý Kho", "inventory-manager", <ShoppingOutlined />, 0, 
            [
              getItem("Danh sách phiếu nhập", "/admin/inventory-receipts", <HistoryOutlined />),
              getItem("Tạo phiếu nhập kho", "/admin/inventory-receipts/create", <ShoppingCartOutlined />),
            ]
        )] : []),
      ...(isAdminOrUser ? [
            getItem(
              "Quản Lý Sản Phẩm",
              "products-manager",
              <AppstoreOutlined />,
              0,
              [
                getItem("Danh sách sản phẩm", "/admin/products", <TagsOutlined />),
                getItem("Thùng rác", "/admin/products/trash", <InboxOutlined />),
              ]
            ),
          ] : []),
      ...(isAdminOrUser ? [
            getItem("Quản Lý Mã Giảm Giá", "discounts-manager", <TagsOutlined />, 0, [
              getItem("Danh sách mã giảm giá", "/admin/discounts", <TagsOutlined />),
              getItem("Thùng rác", "/admin/discounts/trash", <InboxOutlined />),
            ]),
          ] : []),
      ...(isAdminOrUser ? [
            getItem("Quản Lý Nhà Cung Cấp", "suppliers-manager", <ShopOutlined />, 0, [
              getItem("Danh sách nhà cung cấp", "/admin/suppliers", <ShopOutlined />),
              getItem("Thùng rác", "/admin/suppliers/trash", <InboxOutlined />),
            ]),
          ] : []),
      ...(isAdminOrUser ? [
            getItem("Quản Lý Danh Mục", "categories-manager", <InboxOutlined />, 0, [
              getItem("Danh sách danh mục", "/admin/categories", <InboxOutlined />),
              getItem("Thùng rác", "/admin/categories/trash", <InboxOutlined />),
            ]),
          ] : []),
      ...(isAdminOrUser ? [
            getItem("Quản Lý Tài Khoản", "accounts-manager", <UserOutlined />, 0, [
              getItem("Danh sách tài khoản", "/admin/accounts", <UserOutlined />),
              getItem("Thùng rác", "/admin/accounts/trash", <InboxOutlined />),
            ]),
          ] : []),
      
      { type: 'divider' },
      { label: collapsed ? '•' : 'PAGES', type: 'group' },
      
      ...(isAdminOrUser ? [getItem("Quản Lý Đơn Hàng", "/admin/orders", <ShoppingCartOutlined />)] : []),
      ...(isAdminOrUser ? [getItem("Quản Lý Hoàn Tiền", "/admin/refunds", <HistoryOutlined />)] : []),
      ...(isAdminOrUser ? [getItem("Báo Cáo & Thống Kê", "/admin/reports", <BarChartOutlined />)] : []),
      ...(isAdminOrUser ? [getItem("Quản Lý Liên Hệ", "/admin/contacts", <CommentOutlined />)] : []),
    ];
    setItems(menuItems);
  }, [collapsed]);

  // Tìm menu key được chọn và submenu mở
  const getSelectedKeys = () => {
    const path = location.pathname;
    
    // Nếu là các trang con của Đơn hàng (search, create, detail) thì active menu chính "Quản lý đơn hàng"
    if (path.startsWith("/admin/orders")) {
      return ["/admin/orders"];
    }

    // Các mục có submenu (Inventory, Products, Accounts, etc.)
    // Ưu tiên khớp chính xác key con (create, trash) trước, 
    // nếu không khớp (như trang chi tiết :id) thì khớp với danh sách chính
    const managers = [
      { base: "/admin/accounts", key: "/admin/accounts" },
      { base: "/admin/products", key: "/admin/products" },
      { base: "/admin/discounts", key: "/admin/discounts" },
      { base: "/admin/suppliers", key: "/admin/suppliers" },
      { base: "/admin/categories", key: "/admin/categories" },
      { base: "/admin/inventory-receipts", key: "/admin/inventory-receipts" },
    ];

    for (const manager of managers) {
      if (path.startsWith(manager.base)) {
        // Kiểm tra các trang con cụ thể (trash, create)
        if (path.includes("/trash")) return [`${manager.base}/trash`];
        if (path.includes("/create")) return [`${manager.base}/create`];
        return [manager.key];
      }
    }

    return [path];
  };

  const getDefaultOpenKeys = () => {
    const path = location.pathname;

    // Xác định submenu nào cần mở dựa trên path hiện tại
    if (path.includes("/admin/inventory-receipts") || 
        path.includes("/admin/add-inventory-receipt")) {
      return ["inventory-manager"];
    }
    if (path.includes("/admin/products")) {
      return ["products-manager"];
    }
    if (path.includes("/admin/discounts")) {
      return ["discounts-manager"];
    }
    if (path.includes("/admin/suppliers")) {
      return ["suppliers-manager"];
    }
    if (path.includes("/admin/categories")) {
      return ["categories-manager"];
    }
    if (path.includes("/admin/accounts")) {
      return ["accounts-manager"];
    }

    return [];
  };

  // Cập nhật openKeys khi location thay đổi
  useEffect(() => {
    setOpenKeys(getDefaultOpenKeys());
  }, [location.pathname]);

  // Xử lý khi mở/đóng submenu - chỉ cho phép mở 1 submenu tại 1 thời điểm
  const onOpenChange = (keys) => {
    const latestOpenKey = keys.find((key) => openKeys.indexOf(key) === -1);
    
    const rootSubmenuKeys = [
      "inventory-manager",
      "products-manager",
      "discounts-manager",
      "suppliers-manager",
      "categories-manager",
      "accounts-manager",
    ];

    if (rootSubmenuKeys.indexOf(latestOpenKey) === -1) {
      setOpenKeys(keys);
    } else {
      setOpenKeys(latestOpenKey ? [latestOpenKey] : []);
    }
  };

  // Handle responsive sidebar on resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 992) {
        setCollapsed(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div className="nice-admin-layout">
      <AdminHeader
        collapsed={collapsed}
        toggleSidebar={() => setCollapsed(!collapsed)}
      />

      <div className="nice-admin-container">
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={(value) => setCollapsed(value)}
          className="nice-admin-sidebar"
          trigger={null}
          width={220}
          collapsedWidth={window.innerWidth <= 992 ? 0 : 60}
          breakpoint="lg"
        >
          <Menu
            theme="light"
            mode="inline"
            items={items}
            selectedKeys={getSelectedKeys()}
            openKeys={collapsed ? [] : openKeys}
            onOpenChange={onOpenChange}
            onClick={(e) => navigate(e.key)}
            className="nice-admin-menu"
          />
        </Sider>

        <Layout className="nice-admin-content-container" style={{ 
          marginLeft: (window.innerWidth <= 992) ? 0 : (collapsed ? "60px" : "220px"),
          transition: 'all 0.2s',
          backgroundColor: '#f6f9ff', /* Đồng bộ màu nền Admin */
          display: 'flex',
          flexDirection: 'column'
        }}>
          <Content className="nice-admin-content">
            <div
              className="nice-admin-content-inner"
              style={{
                background: 'transparent', // Thay đổi để thấy màu nền cha
                padding: '20px 30px',
              }}
            >
              <Outlet />
            </div>
          </Content>

          {/* Footer Admin */}
          <footer className="nice-admin-footer">
            <div className="copyright">
              &copy; Copyright <strong><span>BICH THUY MARKET</span></strong>. Powered by Haravan
            </div>
            <div className="credits">
              Designed by <a href="" target="_blank" rel="noreferrer">Bich Thuy Market</a>
            </div>
          </footer>
        </Layout>
        
        {/* Overlay for mobile sidebar */}
        {!collapsed && window.innerWidth <= 992 && (
          <div 
            className="nice-admin-sidebar-overlay" 
            onClick={() => setCollapsed(true)}
          ></div>
        )}
      </div>

      <ScrollToTopButton />

      <style>{`
        .nice-admin-layout {
          min-height: 100vh;
          display: flex;
          flex-direction: column;
        }

        .nice-admin-container {
          display: flex;
          flex: 1;
          margin-top: 60px;
          background-color: #f6f9ff;
        }

        /* Footer Admin Styling */
        .nice-admin-footer {
          padding: 20px 0;
          font-size: 14px;
          transition: all 0.3s;
          border-top: 1px solid #f0f0f0;
          background-color: transparent;
          text-align: center;
          color: #012970;
          margin-top: auto;
        }

        .nice-admin-footer .copyright {
          margin-bottom: 5px;
        }

        .nice-admin-footer .credits {
          font-size: 13px;
        }

        .nice-admin-footer .credits a {
          color: #4154f1;
          text-decoration: none;
        }

        .nice-admin-footer .credits a:hover {
          color: #1890ff;
        }

        .nice-admin-sidebar {
          background-color: #fff !important;
          border-right: 1px solid #f0f0f0 !important;
          height: calc(100vh - 60px);
          position: fixed !important;
          left: 0;
          top: 60px;
          z-index: 996;
          overflow-y: auto;
          overflow-x: hidden;
          transition: all 0.2s ease !important;
          scrollbar-gutter: stable; /* Quan trọng: Giữ không gian cho scrollbar để không bị giật ngang */
        }

        .nice-admin-sidebar .ant-layout-sider-children {
          display: flex;
          flex-direction: column;
          height: 100%;
        }

        /* Tối ưu hóa việc hiển thị Menu để không bị nhảy */
        .nice-admin-menu {
          border-right: none !important;
          flex: 1;
          width: 100%;
        }

        .nice-admin-menu .ant-menu-item,
        .nice-admin-menu .ant-menu-submenu-title {
          height: 48px !important;
          line-height: 48px !important;
          margin: 4px 8px !important; /* Khoảng cách đều 2 bên để "bong bóng" màu xanh cân đối */
          padding: 4px 4px 8px 4px !important; /* Tăng padding để text không dính sát mép */
          border-radius: 8px; /* Bo góc tròn hơn cho hiện đại */
          font-size: 14px;
          font-weight: 500;
          transition: background 0.3s, color 0.3s !important;
          display: flex;
          align-items: center;
        }

        /* Đưa icon mũi tên (arrow) vào trong, tạo khoảng cách với mép phải của "bong bóng" */
        .nice-admin-menu .ant-menu-submenu-arrow {
          right: 6px !important; /* Cách mép phải của màu xanh 6px như ý bạn */
          transition: transform 0.3s !important;
        }

        .nice-admin-menu .ant-menu-sub .ant-menu-item {
          height: 40px !important;
          line-height: 40px !important;
          margin: 2px 8px !important;
          padding-left: 12px !important; /* Tăng padding để phân cấp rõ ràng con với cha */
          border-radius: 6px;
          font-size: 14px;
          font-weight: 400;
        }

        .nice-admin-menu .ant-menu-item:hover,
        .nice-admin-menu .ant-menu-submenu-title:hover {
          background-color: #f0f5ff !important;
          color: #1890ff !important;
        }

        /* Selected item indicator */
        .nice-admin-menu .ant-menu-item-selected::after,
        .nice-admin-menu .ant-menu-submenu-selected > .ant-menu-submenu-title::after {
          content: "";
          position: absolute;
          left: -4px; /* Đẩy ra xa một chút so với mép trái của title content */
          top: 0;
          width: 6px;
          height: 100%;
          background-color: #1890ff;
          border-radius: 0 4px 4px 0;
        }

        /* Selected submenu title color */
        .nice-admin-menu .ant-menu-submenu-selected > .ant-menu-submenu-title {
          color: #1890ff !important;
          background-color: #f0f5ff !important;
        }

        .nice-admin-menu .ant-menu-item-selected {
          background-color: #e6f4ff !important;
          color: #1890ff !important;
          font-weight: 600;
        }

        .nice-admin-menu .ant-menu-item .anticon,
        .nice-admin-menu .ant-menu-submenu-title .anticon {
          font-size: 14px;
        }

        /* Collapsed state */
        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-item,
        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-submenu-title {
          padding: 0 !important;
          margin: 4px 0 !important;
          display: flex !important;
          justify-content: center !important;
          align-items: center !important;
        }

        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-item .ant-menu-title-content,
        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-submenu-title .ant-menu-title-content {
          display: none !important;
        }

        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-item .anticon,
        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-submenu-title .anticon {
          margin: 0 !important;
          font-size: 18px !important;
          line-height: 1 !important;
        }
        
        .nice-admin-sidebar.ant-layout-sider-collapsed .ant-menu-item-group-title {
          padding: 0 !important;
          text-align: center !important;
          font-size: 18px !important;
          line-height: 48px !important;
        }

        /* Content area */
        .nice-admin-content-container {
          transition: margin-left 0.2s;
          min-height: calc(100vh - 60px);
        }

        .nice-admin-content-inner {
          padding: 20px;
          min-height: calc(100vh - 60px);
        }

        /* Responsive */
        @media (max-width: 992px) {
          .nice-admin-sidebar {
            position: fixed !important;
            z-index: 1000;
            left: 0 !important;
            transform: translateX(-100%);
            width: 260px !important;
            min-width: 260px !important;
            max-width: 260px !important;
          }

          .nice-admin-sidebar:not(.ant-layout-sider-collapsed) {
            transform: translateX(0);
          }

          .nice-admin-sidebar-overlay {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.4);
            z-index: 995;
            display: block;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminLayout;