import React, { useState, useEffect } from 'react';
import { FaUndo, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import {
  MailOutlined,
  PhoneOutlined,
  ExclamationCircleOutlined,
  ClockCircleOutlined
} from '@ant-design/icons';
import { Avatar, Button, Space, Typography, Tag, Tooltip, Modal, Table } from 'antd';
import './AccountAdmin.css';
import { Link } from 'react-router-dom';
import CustomPagination from '../../components/CustomPagination/CustomPagination';
import { searchUserTrash, restoreUsers } from '../../api/userTrashBin';
import { useRoles } from "../../context/RoleContext.jsx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const { Text } = Typography;

const AccountTrashBinAdmin = () => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [trashData, setTrashData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0
  });
  const [selectedIds, setSelectedIds] = useState([]);

  const allRoles = useRoles();

  const getRoleName = (roleCode) => {
    if (!allRoles || allRoles.length === 0) {
      const roles = {
        'ADMIN': 'Quản trị viên',
        'CUSTOMER': 'Khách hàng',
        'STAFF_INVENTORY': 'Nhân viên kiểm kho',
        'STAFF_SALE': 'Nhân viên bán hàng',
        'STAFF_CUSTOMER_SERVICE': 'Nhân viên CSKH'
      };
      return roles[roleCode] || roleCode;
    }
    const role = allRoles.find(r => r.code === roleCode);
    return role ? role.description : roleCode;
  };

  const getFirstLetterAvatar = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
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

  const fetchDeletedUsers = async () => {
    setLoading(true);
    try {
      const response = await searchUserTrash(currentPage, pageSize);
      if (response) {
        if (response.data && response.data.length === 0 && currentPage > 1) {
          setCurrentPage(prev => prev - 1);
        } else {
          setTrashData(response);
        }
      }
    } catch (error) {
      console.error("Failed to fetch trash bin data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeletedUsers();
    setSelectedIds([]);
  }, [currentPage, pageSize]);

  const handleRestore = (userId) => {
    Modal.confirm({
      title: 'Xác nhận khôi phục',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn khôi phục tài khoản này?',
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          await restoreUsers(userId);
          fetchDeletedUsers();
          setSelectedIds(prev => prev.filter(id => id !== userId));
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const restoreSelectedUsers = () => {
    Modal.confirm({
      title: 'Xác nhận khôi phục hàng loạt',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn khôi phục ${selectedIds.length} tài khoản đã chọn?`,
      okText: 'Khôi phục',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          await restoreUsers(selectedIds);
          setSelectedIds([]);
          fetchDeletedUsers();
        } finally {
          setLoading(false);
        }
      },
    });
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
      title: "Thông tin người dùng",
      key: "userInfo",
      render: (_, record) => (
        <Space size="middle">
          <Avatar style={{ backgroundColor: "#1890ff", verticalAlign: "middle" }}>
            {getFirstLetterAvatar(record.user?.fullName)}
          </Avatar>
          <Space orientation="vertical" size={0}>
            <Space size={4}>
              <Text strong style={{ paddingRight: "24px" }}>
                {record.user?.fullName || "N/A"}
              </Text>
              <Tag color={record.user?.gender === "Nam" ? "blue" : record.user?.gender === "Nữ" ? "pink" : "gray"}>
                {record.user?.gender || "Khác"}
              </Tag>
            </Space>
            <Text type="secondary" style={{ fontSize: 12 }}>
              ID: {record.user?.id}
            </Text>
          </Space>
        </Space>
      ),
    },
    {
      title: "Vai trò",
      key: "roles",
      render: (_, record) =>
        record.user?.roles && record.user.roles.length > 0 ? (
          <Space orientation="vertical" size={4}>
            {record.user.roles.map((roleCode) => (
              <Tag color="blue" key={roleCode} style={{ margin: 0 }}>
                {getRoleName(roleCode)}
              </Tag>
            ))}
          </Space>
        ) : (
          <Text type="secondary">Chưa phân quyền</Text>
        ),
    },
    {
      title: "Thông tin liên hệ",
      key: "contact",
      render: (_, record) => (
        <Space orientation="vertical" size={1}>
          <Space>
            <MailOutlined style={{ color: "#1890ff" }} />
            <Text>{record.user?.username || "N/A"}</Text>
          </Space>
          <Space>
            <PhoneOutlined style={{ color: "#52c41a" }} />
            <Text>{record.user?.phone || "N/A"}</Text>
          </Space>
        </Space>
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
        <Tooltip title="Khôi phục">
          <Button
            type="link"
            icon={<FaUndo />}
            style={{ color: "#52c41a" }}
            onClick={() => handleRestore(record.user?.id)}
          />
        </Tooltip>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys: selectedIds,
    onChange: (selectedRowKeys) => setSelectedIds(selectedRowKeys),
    getCheckboxProps: (record) => ({
      disabled: !record.user?.id,
    }),
  };

  return (
    <div className="account-admin-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý tài khoản</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> /{" "}
          <Link to="/admin/accounts">Quản lý tài khoản</Link> /{" "}
          <span className="active">Danh sách tài khoản đã xóa</span>
        </div>
      </div>

      <div className="admin-card">
        {/* Action Row */}
        <div className="table-actions-row">
          <div className="stats" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div>
              Tổng số: <span className="count">{trashData.totalElements}</span> bản ghi đã xóa
            </div>
            {selectedIds.length > 0 && (
              <button
                className="btn-primary"
                onClick={restoreSelectedUsers}
                style={{ backgroundColor: '#52c41a', color: 'white' }}
              >
                <FaUndo /> Khôi phục {selectedIds.length} tài khoản
              </button>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table
            rowSelection={rowSelection}
            dataSource={trashData.data}
            columns={columns}
            rowKey={(record) => record.user?.id ?? record.id}
            pagination={false}
            bordered
            size="middle"
            loading={loading}
          />
          
          <CustomPagination
            current={currentPage}
            pageSize={pageSize}
            total={trashData.totalElements}
            onChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            layout="right" // Mode 2: only on the right
          />
        </div>
      </div>
    </div>
  );
};

export default AccountTrashBinAdmin;
