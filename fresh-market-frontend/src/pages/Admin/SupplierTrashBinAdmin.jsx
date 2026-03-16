import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUndo } from "react-icons/fa";
import { ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Button, Space, Typography, Tag, Tooltip, Modal, Table } from "antd";
import { getSupplierTrash, restoreSuppliers } from "../../api/supplierTrashBin";
import { useSuppliers } from "../../context/SupplierContext";
import "./AccountAdmin.css";

const { Text } = Typography;

const SupplierTrashBinAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [trashData, setTrashData] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState([]);

  const supplierContext = useSuppliers();
  const refreshSuppliers = supplierContext?.refreshSuppliers;

  const fetchDeletedSuppliers = async (page = currentPage, size = pageSize) => {
    setLoading(true);
    try {
      const response = await getSupplierTrash(page, size);
      if (response) {
        const list = Array.isArray(response) ? response : (response.data || []);
        const total = Array.isArray(response) ? response.length : (response.totalElements || 0);
        setTrashData(list);
        setTotalElements(total);
      } else {
        setTrashData([]);
        setTotalElements(0);
      }
    } catch (error) {
      console.error("Failed to fetch supplier trash bin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedSuppliers(currentPage, pageSize);
    setSelectedIds([]);
  }, [currentPage, pageSize]);

  const handleRestore = (trashBinId) => {
    Modal.confirm({
      title: "Xác nhận khôi phục",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn khôi phục nhà cung cấp này?",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const success = await restoreSuppliers([trashBinId]);
          if (success) {
            if (refreshSuppliers) await refreshSuppliers();
            fetchDeletedSuppliers(currentPage, pageSize);
            setSelectedIds((prev) => prev.filter((id) => id !== trashBinId));
          }
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const restoreSelectedSuppliers = () => {
    Modal.confirm({
      title: "Xác nhận khôi phục hàng loạt",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn khôi phục ${selectedIds.length} nhà cung cấp đã chọn?`,
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const success = await restoreSuppliers(selectedIds);
          if (success) {
            setSelectedIds([]);
            if (refreshSuppliers) await refreshSuppliers();
            fetchDeletedSuppliers(currentPage, pageSize);
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
      width: 70,
      align: "center",
      render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
    },
    {
      title: "Mã nhà cung cấp",
      key: "code",
      render: (_, record) => (
        <Text strong>{record.supplier?.code || "N/A"}</Text>
      ),
    },
    {
      title: "Tên nhà cung cấp",
      key: "name",
      render: (_, record) => <span>{record.supplier?.name || "N/A"}</span>,
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
              onClick={() => handleRestore(record.id)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (selectedRowKeys) => setSelectedIds(selectedRowKeys),
  };

  return (
    <div className="account-admin-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý nhà cung cấp</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> /{" "}
          <Link to="/admin/suppliers">Quản lý nhà cung cấp</Link> /{" "}
          <span className="active">Thùng rác nhà cung cấp</span>
        </div>
      </div>

      <div className="admin-card">
        {/* Action Row */}
        <div className="table-actions-row">
          <div
            className="stats"
            style={{ display: "flex", alignItems: "center", gap: "15px" }}
          >
            <div>
              Tổng số: <span className="count">{totalElements}</span> bản ghi đã xóa
            </div>
            {selectedIds.length > 0 && (
              <button
                className="btn-primary"
                onClick={restoreSelectedSuppliers}
                style={{ backgroundColor: "#52c41a", color: "white" }}
              >
                <FaUndo /> Khôi phục {selectedIds.length} nhà cung cấp
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
            rowKey="id"
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

export default SupplierTrashBinAdmin;
