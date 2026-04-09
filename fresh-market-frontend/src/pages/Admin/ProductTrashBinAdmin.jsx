import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUndo } from "react-icons/fa";
import { ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Space, Typography, Tag, Tooltip, Modal, Table, App } from "antd";
import { getTrashBinProducts, restoreProducts } from "../../api/product";
import { IMAGE_URL, DEFAULT_IMAGE } from "../../api/auth";
import "./AccountAdmin.css";
import "./ProductAdmin.css";
import dayjs from "dayjs";
import CustomPagination from "../../components/CustomPagination/CustomPagination";
import MyButton from "../../components/MyButton";

const { Text } = Typography;

const ProductTrashBinAdmin = () => {
  const { message, modal } = App.useApp();
  const [loading, setLoading] = useState(false);
  const [trashData, setTrashData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  // Fetch deleted products
  const fetchDeletedProducts = async () => {
    setLoading(true);
    try {
      const response = await getTrashBinProducts(currentPage, pageSize);
      if (response) {
        setTrashData(response.data || []);
        setTotalElements(response.totalElements || 0);
      } else {
        setTrashData([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Failed to fetch product trash bin data:", error);
      message.error(error.message || "Không thể tải dữ liệu thùng rác");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedProducts();
  }, [currentPage, pageSize]);

  useEffect(() => {
    setSelectedIds([]);
  }, [currentPage, pageSize]);

  const handleRestore = (productId) => {
    modal.confirm({
      title: "Xác nhận khôi phục",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn khôi phục sản phẩm này?",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          await restoreProducts([productId]);
          message.success("Khôi phục sản phẩm thành công");
          fetchDeletedProducts();
          setSelectedIds((prev) => prev.filter((id) => id !== productId));
        } catch (error) {
          message.error(error.message || "Khôi phục sản phẩm thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const restoreSelectedProducts = () => {
    modal.confirm({
      title: "Xác nhận khôi phục hàng loạt",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn khôi phục ${selectedIds.length} sản phẩm đã chọn?`,
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          await restoreProducts(selectedIds);
          message.success(`Khôi phục ${selectedIds.length} sản phẩm thành công`);
          setSelectedIds([]);
          fetchDeletedProducts();
        } catch (error) {
          message.error(error.message || "Khôi phục hàng loạt thất bại");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getRemainingTimeColor = (remainingTime) => {
    if (!remainingTime || remainingTime === "Hết hạn") return "error";
    const daysMatch = remainingTime.match(/(\d+)\s*ngày/);
    if (!daysMatch) return "error";
    const days = parseInt(daysMatch[1]);
    if (days < 10) return "error";
    if (days < 30) return "warning";
    return "success";
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Thông tin sản phẩm",
      key: "productInfo",
      render: (_, record) => (
        <div className="product-info-wrapper">
          <img 
            src={record.product?.images && record.product.images.length > 0 ? `${IMAGE_URL}/${record.product.images[0]}` : `${DEFAULT_IMAGE}`} 
            alt={record.product?.name}
            className="product-img"
          />
          <div className="product-details">
            {record.product?.name || "N/A"}
            <br />
            <span className="product-code">{record.product?.code || "N/A"}</span>
          </div>
        </div>
      ),
    },
    {
      title: "Phân loại",
      key: "categories",
      width: 150,
      render: (_, record) => (
        <div className="tag-stack">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
            {record.product?.categoryCodes && record.product.categoryCodes.length > 0 ? (
              record.product.categoryCodes.map(catCode => (
                <Tag key={catCode} color="blue" className="pill-tag" style={{ margin: 0 }}>{catCode}</Tag>
              ))
            ) : (
              <Tag color="default" className="pill-tag">N/A</Tag>
            )}
          </div>
          <Tag color="green" className="pill-tag">{record.product?.supplierCode || 'N/A'}</Tag>
        </div>
      ),
    },
    {
      title: "Giá bán",
      key: "price",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Text strong>{record.product?.price?.toLocaleString()}đ</Text>
      ),
    },
    // {
    //   title: "Ngày xóa",
    //   key: "deletedDate",
    //   align: "center",
    //   render: (_, record) => (
    //     <Text style={{ fontSize: "14px" }}>
    //       {record.deletedDate ? dayjs(record.deletedDate).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
    //     </Text>
    //   ),
    // },
    {
      title: "Thời gian còn lại",
      key: "remainingTime",
      align: "center",
      render: (_, record) => (
        <Tag
          icon={<ClockCircleOutlined />}
          color={getRemainingTimeColor(record.remainingTime)}
        >
          {record.remainingTime}
        </Tag>
      ),
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Khôi phục">
            <MyButton
              type="link"
              icon={<FaUndo />}
              style={{ color: "#52c41a" }}
              onClick={() => handleRestore(record.product?.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (selectedRowKeys) => {
      setSelectedIds(selectedRowKeys);
    },
    getCheckboxProps: (record) => ({
      disabled: !record.product?.id,
    }),
  };

  return (
    <div className="account-admin-container">
      <div className="pagetitle mb-4">
        <h1>Thùng rác sản phẩm</h1>
        <nav>
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/admin/products">Quản lý sản phẩm</Link></li>
            <li className="breadcrumb-item active">Thùng rác sản phẩm</li>
          </ol>
        </nav>
      </div>

      <div className="admin-card">
        {/* Action Row */}
        <div className="table-actions-row">
          <div
            className="stats"
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
            <div>
              Tổng số:{" "}
              <span className="count">{totalElements}</span> sản phẩm đã xóa
            </div>
            {selectedIds.length > 0 && (
              <MyButton
                className="btn-primary"
                onClick={restoreSelectedProducts}
                style={{ backgroundColor: "#52c41a", color: "white", display: "flex", alignItems: "center", gap: "8px" }}
              >
                <FaUndo /> Khôi phục {selectedIds.length} sản phẩm
              </MyButton>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive" style={{ paddingTop: "10px" }}>
          <Table
            rowSelection={rowSelection}
            dataSource={trashData}
            columns={columns}
            rowKey={(record) => record.product?.id}
            pagination={false}
            bordered
            size="middle"
            loading={loading}
          />

          <CustomPagination 
            current={currentPage}
            pageSize={pageSize}
            total={totalElements}
            onChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            layout="right"
          />
        </div>
      </div>
    </div>
  );
};

export default ProductTrashBinAdmin;
