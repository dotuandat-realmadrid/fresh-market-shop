import { Breadcrumb, message } from "antd";
import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";

// Import the new component
import OrderByStatus from "../../components/OrderByStatus";
import "../Admin/AccountAdmin.css";

// Giả định hàm getOrdersByUser và cancelOrder (do bạn xử lý fetch)
import { cancelOrder, getOrdersByUser } from "../../api/order";

export default function OrderByUser() {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdminPath = location.pathname.startsWith("/admin");
  const username = location.state?.username || "N/A";

  const urlSearchParams = new URLSearchParams(location.search);
  const initialPage = parseInt(urlSearchParams.get("page")) || 1;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize] = useState(10); // Số lượng bản ghi trên mỗi trang
  const { userId, status } = useParams();
  const [selectedStatus, setSelectedStatus] = useState(status || "PENDING");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getOrdersByUser(
          userId,
          selectedStatus,
          currentPage,
          pageSize
        );
        setData(response);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
        setData({ content: [], totalElements: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedStatus, userId, currentPage, pageSize]);

  // Cập nhật URL khi thay đổi trạng thái hoặc trang
  const updateURL = (status, page, userIdValue) => {
    // Lấy phần path hiện tại (đến url cơ sở)
    const basePath = window.location.pathname.split("/orders")[0];

    // Xây dựng phần path chính
    let path = `${basePath}/orders`;

    if (userIdValue) {
      path += `/user/${userIdValue}`;
    }

    if (status) {
      path += `/status/${status}`;
    }

    // Thêm các tham số phân trang dưới dạng query parameters
    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("size", pageSize.toString());

    // Giữ lại state khi điều hướng
    navigate(`${path}?${params.toString()}`, { state: { username } });
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = (status) => {
    setSelectedStatus(status);
    setCurrentPage(1); // Reset về trang 1 khi thay đổi trạng thái
    updateURL(status, 1, userId);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    setCurrentPage(page);
    updateURL(selectedStatus, page, userId);
  };

  // Xử lý hủy đơn hàng
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId); // Giả định API cập nhật trạng thái thành CANCELLED
      message.success("Đã hủy đơn hàng thành công!");
      // Làm mới dữ liệu sau khi hủy
      const response = await getOrdersByUser(
          userId,
          selectedStatus,
          currentPage,
          pageSize
      );
      setData(response);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      message.error("Hủy đơn hàng thất bại!");
    }
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Lịch sử đặt hàng</h1>
        <div className="breadcrumbs">
          {isAdminPath ? (
            <>
              <Link to="/admin">Dashboard</Link>
              <span style={{ margin: '0 8px' }}> / </span>
              <Link to="/admin/accounts">Quản lý tài khoản</Link>
              <span style={{ margin: '0 8px' }}> / </span>
              <Link to={`/admin/accounts/${userId}`}>{username}</Link>
              <span style={{ margin: '0 8px' }}> / </span>
              <span className="active">Lịch sử đặt hàng</span>
            </>
          ) : (
            <>
              <Link to="/">Trang chủ</Link>
              <span style={{ margin: '0 8px', color: '#999' }}> / </span>
              <Link to="/my-profile">Thông tin tài khoản</Link>
              <span style={{ margin: '0 8px', color: '#999' }}> / </span>
              <span className="active">Lịch sử đặt hàng</span>
            </>
          )}
        </div>
      </div>

      <OrderByStatus
        data={data}
        loading={loading}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
        currentPage={currentPage}
        pageSize={pageSize}
        onPageChange={handlePageChange}
        onCancelOrder={handleCancelOrder}
      />
    </>
  );
}
