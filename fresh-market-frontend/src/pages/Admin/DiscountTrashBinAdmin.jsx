import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUndo } from "react-icons/fa";
import { ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Space, Typography, Tag, Tooltip, Modal, Table } from "antd";
import { getDiscountTrash, restoreDiscounts } from "../../api/discountTrashBin";
import "./AccountAdmin.css";
import dayjs from "dayjs";

const { Text } = Typography;

const DiscountTrashBinAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [trashData, setTrashData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch deleted discounts
  const fetchDeletedDiscounts = async () => {
    setLoading(true);
    try {
      const data = await getDiscountTrash();
      if (data) {
        setTrashData(data);
      } else {
        setTrashData([]);
      }
    } catch (error) {
      console.error("Failed to fetch discount trash bin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedDiscounts();
    setSelectedIds([]);
  }, []);

  // Tự động làm mới dữ liệu mỗi 30 giây để cập nhật thời gian còn lại
  useEffect(() => {
    const interval = setInterval(() => {
      fetchDeletedDiscounts();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleRestore = (discountId) => {
    Modal.confirm({
      title: "Xác nhận khôi phục",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn khôi phục mã giảm giá này?",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const success = await restoreDiscounts([discountId]);
          if (success) {
            fetchDeletedDiscounts();
            setSelectedIds((prev) => prev.filter((id) => id !== discountId));
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const restoreSelectedDiscounts = () => {
    Modal.confirm({
      title: "Xác nhận khôi phục hàng loạt",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn khôi phục ${selectedIds.length} mã giảm giá đã chọn?`,
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const success = await restoreDiscounts(selectedIds);
          if (success) {
            setSelectedIds([]);
            fetchDeletedDiscounts();
          }
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
    if (days < 15) return "error";
    if (days < 40) return "warning";
    return "success";
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên mã giảm giá",
      key: "name",
      align: "center",
      render: (_, record) => (
        <Text strong>{record.discount?.name || "N/A"}</Text>
      ),
    },
    {
      title: "Phần trăm giảm giá",
      key: "percent",
      align: "center",
      render: (_, record) => (
        <span>
          {record.discount?.percent != null
            ? record.discount.percent.toFixed(2) + "%"
            : "0%"}
        </span>
      ),
    },
    {
      title: "Thời gian áp dụng",
      key: "dateRange",
      align: "center",
      render: (_, record) => (
        <Text style={{ fontSize: "14px" }}>
          Từ {record.discount?.startDate ? dayjs(record.discount.startDate).format("DD/MM/YYYY") : "N/A"}
          <br />
          Đến {record.discount?.endDate ? dayjs(record.discount.endDate).format("DD/MM/YYYY") : "N/A"}
        </Text>
      ),
    },
    {
      title: "Trạng thái",
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
            <Button
              type="link"
              icon={<FaUndo />}
              style={{ color: "#52c41a" }}
              onClick={() => handleRestore(record.discount?.id)}
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
      disabled: !record.discount?.id,
    }),
  };

  return (
    <div className="account-admin-container">
      <div className="pagetitle mb-4">
        <h1>Thùng rác mã giảm giá</h1>
        <nav>
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/admin/discounts">Quản lý mã giảm giá</Link></li>
            <li className="breadcrumb-item active">Thùng rác mã giảm giá</li>
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
              <span className="count">{trashData.length}</span> bản ghi đã xóa
            </div>
            {selectedIds.length > 0 && (
              <button
                className="btn-primary"
                onClick={restoreSelectedDiscounts}
                style={{ backgroundColor: "#52c41a", color: "white" }}
              >
                <FaUndo /> Khôi phục {selectedIds.length} mã giảm giá
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive" style={{ paddingTop: "10px" }}>
          <Table
            rowSelection={rowSelection}
            dataSource={trashData}
            columns={columns}
            rowKey={(record) => record.discount?.id ?? record.id}
            pagination={false}
            bordered
            size="middle"
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};

export default DiscountTrashBinAdmin;
