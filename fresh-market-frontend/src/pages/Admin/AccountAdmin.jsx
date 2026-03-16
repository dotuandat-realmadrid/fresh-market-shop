import React, { useState, useEffect } from 'react';
import { 
  FaSearch, 
  FaPlus, 
  FaFilter, 
  FaTrashAlt, 
  FaUser, 
  FaEnvelope, 
  FaPhoneAlt, 
  FaIdCard,
  FaChevronDown,
  FaUserPlus,
  FaTimes,
  FaEye,
  FaEyeSlash,
  FaChevronLeft,
  FaChevronRight
} from 'react-icons/fa';
import { 
  MailOutlined, 
  PhoneOutlined, 
  EyeOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Avatar, Space, Typography, Tag, Tooltip, Button, message, Modal, Table, Pagination } from 'antd';
const { Text } = Typography;
import './AccountAdmin.css';
import { Link, useNavigate } from 'react-router-dom';
import CustomPagination from '../../components/CustomPagination/CustomPagination';
import { searchUser, createUser, deleteUser } from '../../api/user';
import { useRoles } from "../../context/RoleContext.jsx";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

const AccountAdmin = () => {
  const [showFilter, setShowFilter] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState("Tất cả vai trò");
  const [isRoleOpen, setIsRoleOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0
  });
  const [selectedIds, setSelectedIds] = useState([]);

  // Format date function
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return dayjs(dateString).format("DD/MM/YYYY");
  };

  const navigate = useNavigate();

  // Filter states
  const [filters, setFilters] = useState({
    id: "",
    username: "",
    fullName: "",
    phone: "",
    role: "",
    isGuest: ""
  });

  const [newUser, setNewUser] = useState({
    fullName: "",
    username: "",
    phone: "",
    gender: "Nam",
    dob: "",
    password: "",
    confirmPassword: "",
    roles: []
  });

  const fetchUsers = async (searchFilters = null) => {
    setLoading(true);
    try {
      const response = await searchUser(searchFilters || filters, currentPage, pageSize);
      if (response) {
        setUserData(response);
      }
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [currentPage, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchUsers();
  };

  const handleReset = () => {
    const emptyFilters = {
      id: "",
      username: "",
      fullName: "",
      phone: "",
      role: "",
      isGuest: ""
    };
    setFilters(emptyFilters);
    setSelectedRole("Tất cả vai trò");
    setCurrentPage(1);
    // Gọi fetchUsers ngay lập tức với các filter rỗng
    fetchUsers(emptyFilters);
  };

  const handleRoleChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setNewUser({ ...newUser, roles: [...newUser.roles, value] });
    } else {
      setNewUser({ ...newUser, roles: newUser.roles.filter(role => role !== value) });
    }
  };

  const handleCreateUser = async () => {
    // Validation
    if (!newUser.fullName || !newUser.username || !newUser.phone || !newUser.password) {
      message.error("Vui lòng điền đầy đủ các thông tin bắt buộc!");
      return;
    }

    if (newUser.password !== newUser.confirmPassword) {
      message.error("Mật khẩu xác nhận không khớp!");
      return;
    }

    if (newUser.roles.length === 0) {
      message.error("Vui lòng chọn ít nhất một vai trò!");
      return;
    }

    setLoading(true);
    try {
      await createUser({
        fullName: newUser.fullName,
        username: newUser.username,
        phone: newUser.phone,
        gender: newUser.gender,
        dob: newUser.dob,
        password: newUser.password,
        roles: newUser.roles
      });
      
      setShowAddModal(false);
      // Reset form
      setNewUser({
        fullName: "",
        username: "",
        phone: "",
        gender: "Nam",
        dob: "",
        password: "",
        confirmPassword: "",
        roles: []
      });
      // Refresh list
      fetchUsers();
    } catch (error) {
      console.error("Create user failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectRow = (id, isActive) => {
    if (!isActive) return;
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const activeIds = userData.data
        .filter(item => item.isActive)
        .map(item => item.id);
      setSelectedIds(activeIds);
    } else {
      setSelectedIds([]);
    }
  };

  const deleteSelectedUsers = () => {
    Modal.confirm({
      title: 'Xác nhận xóa tài khoản',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${selectedIds.length} người dùng đã chọn? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          await deleteUser(selectedIds);
          setSelectedIds([]);
          fetchUsers();
        } catch (error) {
          console.error("Bulk delete failed:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const getFirstLetterAvatar = (name) => {
    if (!name) return "U";
    return name.charAt(0).toUpperCase();
  };

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
    return role ? role.description : role.code;
  };

  return (
    <div className="account-admin-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý tài khoản</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> / <Link to="/admin/accounts">Quản lý tài khoản</Link> / <span className="active">Danh sách tài khoản</span>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter Section Header */}
        <div 
          className={`filter-header ${showFilter ? 'active' : ''}`} 
          onClick={() => setShowFilter(!showFilter)}
        >
          <div className="filter-title">
            <FaFilter className="icon" /> Bộ lọc tìm kiếm
          </div>
          <FaChevronDown className={`arrow-icon ${showFilter ? 'up' : ''}`} />
        </div>

        {/* Filter Content */}
        {showFilter && (
          <div className="filter-content">
            <div className="filter-grid">
              <div className="form-group">
                <label>ID người dùng</label>
                <div className="input-wrapper">
                  <FaIdCard className="field-icon" />
                  <input 
                    type="text" 
                    placeholder="Nhập ID" 
                    value={filters.id}
                    onChange={(e) => setFilters({...filters, id: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Email</label>
                <div className="input-wrapper">
                  <FaEnvelope className="field-icon" />
                  <input 
                    type="email" 
                    placeholder="Nhập Email" 
                    value={filters.username}
                    onChange={(e) => setFilters({...filters, username: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Vai trò</label>
                <div 
                  className={`custom-dropdown-wrapper ${isRoleOpen ? 'active' : ''}`}
                  onClick={() => setIsRoleOpen(!isRoleOpen)}
                  onBlur={() => setTimeout(() => setIsRoleOpen(false), 200)}
                  tabIndex="0"
                >
                  <div className="dropdown-selected">
                    {selectedRole}
                    <FaChevronDown className={`select-arrow ${isRoleOpen ? 'open' : ''}`} />
                  </div>
                  {isRoleOpen && (
                    <ul className="dropdown-list">
                      <li key="all-roles" onClick={() => { setSelectedRole("Tất cả vai trò"); setFilters({...filters, role: ""}); }}>Tất cả vai trò</li>
                      {allRoles && allRoles.length > 0 && 
                        allRoles.map(role => (
                          <li key={role.code} onClick={() => { setSelectedRole(role.description); setFilters({...filters, role: role.code}); }}>
                            {role.description}
                          </li>
                        ))
                      }
                    </ul>
                  )}
                </div>
              </div>
              <div className="form-group">
                <label>Họ và tên</label>
                <div className="input-wrapper">
                  <FaUser className="field-icon" />
                  <input 
                    type="text" 
                    placeholder="Nhập họ tên" 
                    value={filters.fullName}
                    onChange={(e) => setFilters({...filters, fullName: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Số điện thoại</label>
                <div className="input-wrapper">
                  <FaPhoneAlt className="field-icon" />
                  <input 
                    type="text" 
                    placeholder="Nhập số điện thoại" 
                    value={filters.phone}
                    onChange={(e) => setFilters({...filters, phone: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Loại tài khoản</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="accountType" 
                      checked={filters.isGuest === ""} 
                      onChange={() => setFilters({...filters, isGuest: ""})}
                    />
                    <span className="radio-custom"></span> Tất cả
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="accountType" 
                      checked={filters.isGuest === "0"}
                      onChange={() => setFilters({...filters, isGuest: "0"})}
                    />
                    <span className="radio-custom"></span> Người dùng hệ thống
                  </label>
                  <label className="radio-label">
                    <input 
                      type="radio" 
                      name="accountType" 
                      checked={filters.isGuest === "1"}
                      onChange={() => setFilters({...filters, isGuest: "1"})}
                    />
                    <span className="radio-custom"></span> Khách
                  </label>
                </div>
              </div>
            </div>
            <div className="filter-actions">
              <button className="btn-secondary" onClick={handleReset}>
                <FaTrashAlt /> Xóa bộ lọc
              </button>
              <button className="btn-primary" onClick={handleSearch}>
                <FaSearch /> Tìm kiếm
              </button>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="table-actions-row">
          <div className="stats" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div>Tổng số: <span className="count">{userData.totalElements}</span> người dùng</div>
            {selectedIds.length > 0 && (
              <Button className='btn-remove'
                danger 
                type="primary" 
                onClick={deleteSelectedUsers}
              >
                <FaTrashAlt /> Xóa {selectedIds.length} người dùng
              </Button>
            )}
          </div>
          <button className="btn-add" onClick={() => setShowAddModal(true)}>
            <FaPlus /> Thêm mới
          </button>
        </div>

        {/* Data Table */}
        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys),
              getCheckboxProps: (record) => ({ disabled: !record.isActive }),
            }}
            dataSource={userData.data}
            rowKey="id"
            loading={loading}
            bordered
            size="middle"
            pagination={false}
            columns={[
              {
                title: 'STT',
                key: 'stt',
                width: 70,
                align: 'center',
                render: (_, __, index) => (currentPage - 1) * pageSize + index + 1,
              },
              {
                title: 'Thông tin người dùng',
                key: 'userInfo',
                render: (_, item) => (
                  <Space size="middle">
                    <Avatar style={{ backgroundColor: "#1890ff", verticalAlign: "middle" }}>
                      {getFirstLetterAvatar(item.fullName)}
                    </Avatar>
                    <Space orientation="vertical" size={0}>
                      <Space size={4}>
                        <Text strong style={{ ...(!item.isActive ? { color: "#ff4d4f" } : {}), paddingRight: "24px" }}>
                          {item.fullName || "N/A"}
                        </Text>
                        <Tag color={item.gender === "Nam" ? "blue" : item.gender === "Nữ" ? "pink" : "gray"}>
                          {item.gender || "Khác"}
                        </Tag>
                      </Space>
                      <Text type="secondary" style={{ fontSize: 12 }}>ID: {item.id}</Text>
                    </Space>
                    {item.isGuest === 1 && <Tag color="orange">Khách</Tag>}
                    {!item.isActive && <Tag color="red">Không hoạt động</Tag>}
                  </Space>
                ),
              },
              {
                title: 'Vai trò',
                key: 'roles',
                render: (_, item) =>
                  item.roles && item.roles.length > 0 ? (
                    <Space orientation="vertical" size={4}>
                      {item.roles.map((roleCode) => (
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
                title: 'Thông tin liên hệ',
                key: 'contact',
                render: (_, item) => (
                  <Space orientation="vertical" size={1}>
                    <Space>
                      <MailOutlined style={{ color: "#1890ff" }} />
                      <Text>{item.username || "N/A"}</Text>
                    </Space>
                    <Space>
                      <PhoneOutlined style={{ color: "#52c41a" }} />
                      <Text>{item.phone || "N/A"}</Text>
                    </Space>
                  </Space>
                ),
              },
              {
                title: 'Ngày sinh',
                key: 'dob',
                align: 'center',
                render: (_, item) => formatDate(item.dob),
              },
              {
                title: '',
                key: 'action',
                width: 60,
                align: 'center',
                render: (_, item) => (
                  <Tooltip title="Xem chi tiết">
                    <Button
                      type="link"
                      icon={<FaEye />}
                      onClick={() => navigate(`/admin/accounts/${item.id}`)}
                    />
                  </Tooltip>
                ),
              },
            ]}
          />
          
          <CustomPagination
            current={currentPage}
            pageSize={pageSize}
            total={userData.totalElements}
            onChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            layout="full" // You can test with 'right' or 'center' here!
          />
        </div>
      </div>

      {/* Modal Thêm Mới - Ant Design */}
      <Modal
        title={<span>Thêm mới người dùng</span>}
        open={showAddModal}
        onCancel={() => setShowAddModal(false)}
        footer={null}
        destroyOnHidden={true}
        width={460}
        centered
      >
        <div className="modal-body">
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateUser();
            }}
          >
            <div className="modal-form-group">
              <input
                type="text"
                placeholder="Họ và tên"
                value={newUser.fullName}
                onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                required
              />
            </div>
            <div className="modal-form-group">
              <input
                type="email"
                placeholder="Email"
                value={newUser.username}
                onChange={(e) => setNewUser({...newUser, username: e.target.value})}
                required
              />
            </div>
            <div className="modal-form-row">
              <div className="modal-form-group flex-2">
                <input
                  type="text"
                  placeholder="Số điện thoại"
                  value={newUser.phone}
                  onChange={(e) => setNewUser({...newUser, phone: e.target.value})}
                  required
                />
              </div>
              <div className="modal-form-group flex-0-2">
                <input
                  type="date"
                  placeholder="dd/mm/yyyy"
                  value={newUser.dob}
                  onChange={(e) => setNewUser({...newUser, dob: e.target.value})}
                />
              </div>
              <div className="radio-group flex-0-8">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="Nam"
                    checked={newUser.gender === "Nam"}
                    onChange={(e) => setNewUser({...newUser, gender: e.target.value})}
                  />
                  <span className="radio-custom"></span> Nam
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="gender"
                    value="Nữ"
                    checked={newUser.gender === "Nữ"}
                    onChange={(e) => setNewUser({...newUser, gender: e.target.value})}
                  />
                  <span className="radio-custom"></span> Nữ
                </label>
              </div>
            </div>
            <div className="modal-form-group relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Mật khẩu"
                value={newUser.password}
                onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                autoComplete="new-password"
                required
              />
              <span className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
            <div className="modal-form-group relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Nhập lại mật khẩu"
                value={newUser.confirmPassword}
                onChange={(e) => setNewUser({...newUser, confirmPassword: e.target.value})}
                autoComplete="new-password"
                required
              />
              <span className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>

            <div className="role-selection">
              <p className="section-label">Vai trò</p>
              <div className="role-grid">
                {allRoles && allRoles.length > 0 &&
                  allRoles.map(role => (
                    <label key={role.code} className="checkbox-label">
                      <input
                        type="checkbox"
                        value={role.code}
                        checked={newUser.roles.includes(role.code)}
                        onChange={handleRoleChange}
                      /> {role.description}
                    </label>
                  ))
                }
              </div>
            </div>

            <div className="modal-footer-actions">
              <button
                type="submit"
                className="btn-modal-add"
                disabled={loading}
              >
                {loading ? "Đang xử lý..." : "Thêm mới"}
              </button>
            </div>
          </form>
        </div>
      </Modal>

    </div>
  );
};

export default AccountAdmin;

