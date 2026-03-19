import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaUndo } from "react-icons/fa";
import { ClockCircleOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import { Space, Typography, Tag, Tooltip, Modal, Table, App } from "antd";
import { searchTrashBin, restoreTrashBin } from "../../api/categoryTrashBin";
import { useCategories } from "../../context/CategoryContext.jsx";
import "./AccountAdmin.css";
import MyButton from "../../components/MyButton";

const { Text } = Typography;

const CategoryTrashBinAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [trashData, setTrashData] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);

  const { modal, message } = App.useApp();
  const categoryContext = useCategories();
  const refreshCategories = categoryContext?.refreshCategories;

  const fetchDeletedCategories = async () => {
    setLoading(true);
    try {
      // Fetch with a large size to effectively disable pagination from UI perspective
      const response = await searchTrashBin(1, 1000);
      if (response) {
        // Robust list extraction supporting various backend formats
        const list = response.content || response.data || (Array.isArray(response) ? response : []);
        setTrashData(list);
      } else {
        setTrashData([]);
      }
    } catch (error) {
      message.error(error.message || "Tải dữ liệu thùng rác thất bại!");
      setTrashData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedCategories();
    setSelectedIds([]);
  }, []);

  const handleRestore = (trashBinId) => {
    modal.confirm({
      title: "Xác nhận khôi phục",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn khôi phục danh mục này?",
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const success = await restoreTrashBin([trashBinId]);
          if (success) {
            message.success("Khôi phục danh mục thành công");
            if (refreshCategories) await refreshCategories();
            await fetchDeletedCategories();
            setSelectedIds((prev) => prev.filter((id) => id !== trashBinId));
          }
        } catch (error) {
           message.error(error.message || "Khôi phục danh mục thất bại!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const restoreSelectedCategories = () => {
    modal.confirm({
      title: "Xác nhận khôi phục hàng loạt",
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn khôi phục ${selectedIds.length} danh mục đã chọn?`,
      okText: "Khôi phục",
      cancelText: "Hủy",
      onOk: async () => {
        setLoading(true);
        try {
          const success = await restoreTrashBin(selectedIds);
          if (success) {
            message.success(`Khôi phục ${selectedIds.length} danh mục thành công`);
            setSelectedIds([]);
            if (refreshCategories) await refreshCategories();
            await fetchDeletedCategories();
          }
        } catch (error) {
           message.error(error.message || "Khôi phục danh mục thất bại!");
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
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã danh mục",
      key: "code",
      align: 'center',
      render: (_, record) => (
        <Text strong>{record.category?.code || "N/A"}</Text>
      ),
    },
    {
      title: "Tên danh mục",
      key: "name",
      align: 'center',
      render: (_, record) => <span>{record.category?.name || "N/A"}</span>,
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
            <MyButton
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
        <h1 className="page-title">Quản lý danh mục</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> /{" "}
          <Link to="/admin/categories">Quản lý danh mục</Link> /{" "}
          <span className="active">Thùng rác danh mục</span>
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
              Tổng số: <span className="count">{trashData.length}</span> bản ghi đã xóa
            </div>
            {selectedIds.length > 0 && (
              <MyButton
                className="btn-primary"
                onClick={restoreSelectedCategories}
                style={{ backgroundColor: "#52c41a", color: "white" }}
              >
                <FaUndo /> Khôi phục {selectedIds.length} danh mục
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
            rowKey="id"
            loading={loading}
            pagination={false}
            bordered
            size="middle"
          />
        </div>
      </div>
    </div>
  );
};

export default CategoryTrashBinAdmin;
