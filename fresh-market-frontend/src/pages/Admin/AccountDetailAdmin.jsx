import {
  CalendarOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  HomeOutlined,
  KeyOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  SaveOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
  Descriptions,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  message,
} from "antd";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";
import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createAddress,
  deleteAddress,
  getAddressesByUserId,
  updateAddress,
} from "../../api/address";
import { resetPassword } from "../../api/password";
import { deleteUser, getUserById, updateUser } from "../../api/user";
import AddressModal from "../../components/AddressModal";
import { useRoles } from "../../context/RoleContext";
import { hasPermission } from "../../services/authService";
import { useSelector } from "react-redux";

dayjs.extend(customParseFormat);
const dateFormat = "YYYY-MM-DD";
const customFormat = (value) => {
  return value && dayjs(value).isValid()
    ? dayjs(value).format(dateFormat)
    : null;
};

const { Text, Title } = Typography;
const { confirm } = Modal;

export default function AccountDetailAdmin() {
  const [user, setUser] = useState(null);
  const [form] = Form.useForm();
  const [addressData, setAddressData] = useState(null);
  const [initValues, setInitValues] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const roles = useRoles();
  const navigate = useNavigate();
  const { id } = useParams();
  const currentUser = useSelector((state) => state.user);

  // User, Address
  useEffect(() => {
    const getUserData = async () => {
      const response = await getUserById(id);
      setUser(response);
    };

    const getAddressData = async () => {
      const result = await getAddressesByUserId(id);
      setAddressData(result);
    };

    getUserData();
    getAddressData();
  }, [id]);

  const refreshAddressList = async () => {
    const updatedData = await getAddressesByUserId(id);
    setAddressData(updatedData);
  };

  const handleAddAddress = () => {
    setInitValues(null);
    setIsModalOpen(true);
  };

  const handleUpdateAddress = (address) => {
    setInitValues(address);
    setIsModalOpen(true);
  };

  const showDeleteAddressConfirm = (addressId, addressDetail) => {
    confirm({
      title: "Xác nhận xóa địa chỉ",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa địa chỉ "${addressDetail}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteAddress(addressId);
          await refreshAddressList();
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa địa chỉ");
        }
      },
    });
  };

  const handleModalSubmit = async (address) => {
    try {
      if (initValues?.id) {
        await updateAddress(initValues.id, address);
      } else {
        address.userId = id;
        await createAddress(address);
      }
      setIsModalOpen(false);
      await refreshAddressList();
    } catch (error) {
      message.error("Có lỗi xảy ra khi lưu địa chỉ");
    }
  };

  // User
  const handleCancel = () => {
    form.resetFields();
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    setIsEditing(true);
  };

  const onSubmit = async (values) => {
    confirm({
      title: "Xác nhận cập nhật",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật thông tin người dùng này?",
      okText: "Cập nhật",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setIsSubmitting(true);
          const data = {
            username: values.username,
            fullName: values.fullName,
            phone: values.phone,
            dob: customFormat(values.dob),
            gender: values.gender,
            roles: values.roles,
            isGuest: values.isGuest,
          };

          await updateUser(data, id);

          setUser({
            ...user,
            ...data,
          });

          setIsEditing(false);
        } catch (error) {
          message.error("Có lỗi xảy ra khi cập nhật thông tin");
        } finally {
          setIsSubmitting(false);
        }
      },
    });
  };

  const handleDelete = () => {
    confirm({
      title: "Xác nhận xóa tài khoản",
      icon: <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />,
      content: `Bạn có chắc chắn muốn xóa tài khoản "${user.username}" không?`,
      okText: "Xóa",
      okType: "danger",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          await deleteUser(id);
          navigate("/admin/accounts");
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa tài khoản");
        }
      },
    });
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword(id);
    } catch (error) {
      message.error("Có lỗi xảy ra khi đặt lại mật khẩu");
    }
  };

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        id: id,
        username: user.username,
        fullName: user.fullName,
        phone: user.phone,
        dob: user.dob ? dayjs(user.dob) : null,
        gender: user.gender,
        createdDate: dayjs(user.createdDate),
        modifiedBy: user.modifiedBy,
        modifiedDate: dayjs(user.modifiedDate),
        isActive: user.isActive,
        isGuest: user.isGuest,
        roles: user.roles,
      });
    }
  }, [user, id, form]);

  // Function to get first letter of full name for avatar
  const getFirstLetter = () => {
    if (user?.fullName) {
      return user.fullName.charAt(0).toUpperCase();
    }
    return <UserOutlined />;
  };

  if (!user) {
    return (
      <div style={{ padding: "100px", textAlign: "center" }}>
        <Title level={4}>Đang tải thông tin người dùng...</Title>
      </div>
    );
  }

  return (
    <div className="account-detail-admin">
      <div className="page-header">
        <h1 className="page-title">Thông tin tài khoản</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> / <Link to="/admin/accounts">Quản lý tài khoản</Link> / <span className="active">{user.fullName}</span>
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {/* User Information */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <div style={{ display: "flex", alignItems: "center", padding: "10px 0" }}>
                <Avatar
                  size={64}
                  style={{ backgroundColor: "#1890ff", marginRight: 16 }}
                >
                  <span style={{ fontSize: 32 }}>{getFirstLetter()}</span>
                </Avatar>
                <div>
                  <Title level={4} style={{ margin: 0 }}>
                    {user.fullName}
                  </Title>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      marginTop: 4,
                    }}
                  >
                    <MailOutlined style={{ marginRight: 8 }} />
                    <Text>{user.username}</Text>
                  </div>
                  <Space style={{ marginTop: 4 }}>
                    <Badge
                      status={user.isActive === 1 ? "success" : "error"}
                      text={user.isActive === 1 ? "Hoạt động" : "Đã xóa"}
                    />
                    <Badge
                      status={user.isGuest === 0 ? "processing" : "warning"}
                      text={
                        user.isGuest === 0 ? "Người dùng hệ thống" : "Khách"
                      }
                    />
                  </Space>
                </div>
              </div>
            }
            extra={
              <Space>
                {user.isActive === 1 && (
                  <>
                    {isEditing ? (
                      <>
                        <Button icon={<CloseOutlined />} onClick={handleCancel}>
                          Hủy
                        </Button>
                        <Button
                          icon={<SaveOutlined />}
                          type="primary"
                          onClick={form.submit}
                          loading={isSubmitting}
                        >
                          Lưu
                        </Button>
                      </>
                    ) : (
                      <Tooltip title="Chỉnh sửa thông tin">
                        <Button
                          type="primary"
                          icon={<EditOutlined />}
                          onClick={handleStartEditing}
                        >
                          Chỉnh sửa
                        </Button>
                      </Tooltip>
                    )}
                    {(user.id !== currentUser?.id && !(user?.roles || []).includes("ADMIN")) && (
                      <Tooltip title="Xóa tài khoản">
                        <Button
                          danger
                          icon={<DeleteOutlined />}
                          onClick={handleDelete}
                        >
                          Xóa
                        </Button>
                      </Tooltip>
                    )}
                  </>
                )}
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onSubmit}
            >
              {isEditing ? (
                <>
                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item label="ID" name="id">
                        <Input disabled />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item label="Email" name="username">
                        <Input disabled prefix={<MailOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={12}>
                      <Form.Item
                        label="Họ và tên"
                        name="fullName"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập họ và tên",
                          },
                        ]}
                      >
                        <Input prefix={<UserOutlined />} />
                      </Form.Item>
                    </Col>
                    <Col span={12}>
                      <Form.Item
                        label="Số điện thoại"
                        name="phone"
                        rules={[
                          {
                            required: true,
                            message: "Vui lòng nhập số điện thoại",
                          },
                        ]}
                      >
                        <Input prefix={<PhoneOutlined />} />
                      </Form.Item>
                    </Col>
                  </Row>

                  <Row gutter={16}>
                    <Col span={8}>
                      <Form.Item label="Ngày sinh" name="dob">
                        <DatePicker
                          style={{ width: "100%" }}
                          format={dateFormat}
                          placeholder="Chọn ngày sinh"
                          prefix={<CalendarOutlined />}
                        />
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Giới tính" name="gender">
                        <Select placeholder="Chọn giới tính">
                          <Select.Option value="Nam">Nam</Select.Option>
                          <Select.Option value="Nữ">Nữ</Select.Option>
                          <Select.Option value="Khác">Khác</Select.Option>
                        </Select>
                      </Form.Item>
                    </Col>
                    <Col span={8}>
                      <Form.Item label="Loại tài khoản" name="isGuest">
                        <Tag
                          color={user.isGuest === 0 ? "green" : "orange"}
                          style={{ padding: "5px 10px" }}
                        >
                          {user.isGuest === 0 ? "Người dùng hệ thống" : "Khách"}
                        </Tag>
                      </Form.Item>
                    </Col>
                  </Row>

                  <Form.Item label="Vai trò" name="roles" hidden={!hasPermission(["ROLE_ADMIN"]) || user.id === currentUser.id}>
                    <Checkbox.Group>
                      {roles.map((role) => (
                        <Checkbox key={role.code} value={role.code}>
                          {role.description}
                        </Checkbox>
                      ))}
                    </Checkbox.Group>
                  </Form.Item>
                </>
              ) : (
                <Descriptions
                  bordered
                  column={1}
                  styles={{ label: { fontWeight: "bold", width: "30%" } }}
                >
                  <Descriptions.Item label="ID">{id}</Descriptions.Item>
                  <Descriptions.Item label="Email">
                    {user.username}
                  </Descriptions.Item>
                  <Descriptions.Item label="Họ và tên">
                    {user.fullName}
                  </Descriptions.Item>
                  <Descriptions.Item label="Số điện thoại">
                    {user.phone}
                  </Descriptions.Item>
                  <Descriptions.Item label="Giới tính">
                    {user.gender ? (
                      <Tag color={user.gender === "Nam" ? "blue" : user.gender === "Nữ" ? "pink" : "gray"}>
                        {user.gender}
                      </Tag>
                    ) : "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày sinh">
                    {user.dob
                      ? dayjs(user.dob).format("DD/MM/YYYY")
                      : "Chưa cập nhật"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày tạo">
                    {dayjs(user.createdDate).format("DD/MM/YYYY HH:mm:ss")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Ngày chỉnh sửa">
                    {dayjs(user.modifiedDate).format("DD/MM/YYYY HH:mm:ss")}
                  </Descriptions.Item>
                  <Descriptions.Item label="Người chỉnh sửa">
                    {user.modifiedBy || "N/A"}
                  </Descriptions.Item>
                  <Descriptions.Item label="Vai trò">
                    {(user.roles || []).length > 0 ? (
                      <Space size={[0, 4]} wrap>
                        {roles
                          .filter((role) =>
                            (user.roles || []).includes(role.code)
                          )
                          .map((role) => (
                            <Tag key={role.code} color="blue">
                              {role.description}
                            </Tag>
                          ))}
                      </Space>
                    ) : (
                      "Không có vai trò"
                    )}
                  </Descriptions.Item>
                </Descriptions>
              )}

              {!isEditing && (
                <Row style={{ marginTop: 16 }} gutter={[16, 16]}>
                  {user.hasPassword && user.isActive === 1 && (
                    <Col>
                      <Tooltip title="Đặt lại mật khẩu">
                        <Button
                          onClick={handleResetPassword}
                          type="default"
                          icon={<KeyOutlined />}
                        >
                          Reset mật khẩu
                        </Button>
                      </Tooltip>
                    </Col>
                  )}
                  <Col>
                    <Link
                      to={`/admin/orders/user/${id}/status/PENDING`}
                      state={{ username: user.username }}
                    >
                      <Button type="primary" icon={<HistoryOutlined />}>
                        Lịch sử đặt hàng
                      </Button>
                    </Link>
                  </Col>
                </Row>
              )}
            </Form>
          </Card>
        </Col>

        {/* Address Cards */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <span>Danh sách địa chỉ</span>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddAddress}
                >
                  Thêm địa chỉ
                </Button>
              </div>
            }
          >
            {(addressData || []).length > 0 ? (
              <Space
                orientation="vertical"
                size="middle"
                style={{ width: "100%" }}
              >
                {(addressData || []).map((address) => (
                  <Card
                    key={address.id}
                    size="small"
                    style={{ borderLeft: "4px solid #1890ff" }}
                    actions={[
                      <Tooltip title="Cập nhật" key="edit">
                        <EditOutlined
                          onClick={() => handleUpdateAddress(address)}
                        />
                      </Tooltip>,
                      <Tooltip title="Xóa" key="delete">
                        <DeleteOutlined
                          onClick={() =>
                            showDeleteAddressConfirm(address.id, address.detail)
                          }
                          style={{ color: "#ff4d4f" }}
                        />
                      </Tooltip>,
                    ]}
                  >
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <Avatar
                        size="small"
                        style={{ marginRight: 8, backgroundColor: "#1890ff" }}
                      >
                        {address.fullName ? (
                          address.fullName.charAt(0).toUpperCase()
                        ) : (
                          <UserOutlined />
                        )}
                      </Avatar>
                      <Text strong>{address.fullName}</Text>

                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginLeft: "auto",
                        }}
                      >
                        <PhoneOutlined style={{ marginRight: 8 }} />
                        <Text>{address.phone}</Text>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        marginBottom: 4,
                      }}
                    >
                      <HomeOutlined style={{ marginLeft: 6, marginRight: 10, marginTop: 4 }} />
                      <div>
                        <div>{address.detail}</div>
                        <div>
                          {address.ward}, {address.district}, {address.province}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </Space>
            ) : (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <Text type="secondary">Chưa có địa chỉ nào</Text>
              </div>
            )}
          </Card>
        </Col>
      </Row>

      <AddressModal
        visible={isModalOpen}
        onCancel={() => setIsModalOpen(false)}
        onSubmit={handleModalSubmit}
        initValues={initValues}
        isUpdateAdmin={!!initValues && !!initValues.id}
      />
    </div>
  );
}
