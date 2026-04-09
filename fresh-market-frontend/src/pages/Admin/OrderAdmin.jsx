import { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate, Link } from "react-router-dom";
import { Breadcrumb, message } from "antd";
import { getAllOrder, cancelOrder } from "../../api/order";
import OrderByStatus from "../../components/OrderByStatus";
import "../Admin/AccountAdmin.css";

export default function OrderAdmin() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(5);
  const [selectedStatus, setSelectedStatus] = useState("PENDING");

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const response = await getAllOrder(
          selectedStatus,
          currentPage,
          pageSize
        );
        setData(response);
      } catch (error) {
        console.error("Lỗi khi lấy danh sách đơn hàng:", error);
        setData({ data: [], totalElements: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedStatus, currentPage, pageSize]);

  // Cập nhật trạng thái hoặc trang (không thay đổi URL theo yêu cầu người dùng)
  const updateState = (status, page) => {
    setSelectedStatus(status);
    setCurrentPage(page);
  };

  // Xử lý thay đổi trạng thái
  const handleStatusChange = (status) => {
    updateState(status, 1);
  };

  // Xử lý thay đổi trang
  const handlePageChange = (page) => {
    updateState(selectedStatus, page);
  };

  // Hàm xử lý hủy đơn hàng cho admin
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      message.success("Đã hủy đơn hàng thành công!");

      // Làm mới dữ liệu sau khi hủy
      const response = await getAllOrder(selectedStatus, currentPage, pageSize);
      setData(response);
    } catch (error) {
      console.error("Lỗi khi hủy đơn hàng:", error);
      message.error("Hủy đơn hàng thất bại!");
    }
  };

  return (
    <>
      <div className="pagetitle mb-4">
        <h1>Danh sách đơn hàng</h1>
        <nav>
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/admin/orders">Quản lý đơn hàng</Link></li>
            <li className="breadcrumb-item active">Danh sách đơn hàng</li>
          </ol>
        </nav>
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
