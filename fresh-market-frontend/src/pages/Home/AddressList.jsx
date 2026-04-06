import React, { useState, useEffect } from 'react';
import { Row, Col, Button, message, Popconfirm, Input, Form, Select } from 'antd';
import { 
    EditOutlined, 
    CloseOutlined, 
    UserOutlined, 
    EnvironmentOutlined, 
    PhoneOutlined,
    HomeOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../../reducers/userReducer';
import { getAddressesByUserId, createAddress, updateAddress, deleteAddress } from '../../api/address';
import './AddressList.css';

const { Option } = Select;

const AddressList = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [messageApi, contextHolder] = message.useMessage();
    
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const fetchAddresses = async () => {
        if (!user.id) return;
        setLoading(true);
        try {
            const data = await getAddressesByUserId(user.id);
            setAddresses(data || []);
        } catch (error) {
            console.error("Fetch addresses error:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.id) {
            fetchAddresses();
        } else {
            navigate('/login');
        }
    }, [user.id]);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        navigate('/login');
        messageApi.success('Đăng xuất thành công');
    };

    const handleEdit = (id) => {
        setEditingId(id);
        setIsAdding(false);
    };

    const handleDelete = async (id) => {
        try {
            await deleteAddress(id);
            fetchAddresses();
        } catch (error) {
            console.error("Delete address error:", error);
        }
    };

    const handleAddNew = () => {
        setIsAdding(true);
        setEditingId(null);
    };

    const handleCancel = () => {
        setIsAdding(false);
        setEditingId(null);
    };

    const handleSubmit = async (values) => {
        try {
            const payload = {
                ...values,
                userId: user.id
            };

            if (editingId) {
                await updateAddress(editingId, payload);
            } else {
                await createAddress(payload);
            }
            handleCancel();
            fetchAddresses();
        } catch (error) {
            console.error("Submit address error:", error);
        }
    };

    const Sidebar = () => (
        <div className="account-sidebar">
            <h2 className="sidebar-title">TÀI KHOẢN</h2>
            <ul className="account-sidebar-menu">
                <li>
                    <Link to="/my-profile">
                        <span className="sidebar-icon"></span>
                        Thông tin tài khoản
                    </Link>
                </li>
                <li>
                    <Link to="/my-address" className="active">
                        <span className="sidebar-icon"></span>
                        Danh sách địa chỉ
                    </Link>
                </li>
                <li>
                    <Link to="/my-orders">
                        <span className="sidebar-icon"></span>
                        Đơn hàng của tôi
                    </Link>
                </li>
            </ul>
        </div>
    );

    const AddressFormInline = ({ initialValues, onFinish, onCancel, isUpdate, onEditClick, onDeleteClick, addrId }) => {
        const [form] = Form.useForm();

        useEffect(() => {
            if (initialValues) {
                form.setFieldsValue(initialValues);
            } else {
                form.resetFields();
            }
        }, [initialValues, form]);

        return (
            <div className="address-form-inline">
                <div className="address-card-header">
                    <div className="name">
                        {isUpdate ? initialValues?.fullName : 'Thêm địa chỉ mới'}
                    </div>
                    <div className="address-card-actions">
                        {isUpdate ? (
                            <>
                                <span onClick={onEditClick} title="Sửa"><EditOutlined /></span>
                                <Popconfirm
                                    title="Bạn có chắc chắn muốn xóa địa chỉ này?"
                                    onConfirm={onDeleteClick}
                                    okText="Có"
                                    cancelText="Không"
                                >
                                    <span title="Xóa"><CloseOutlined /></span>
                                </Popconfirm>
                            </>
                        ) : (
                            <span onClick={onCancel} title="Đóng"><CloseOutlined /></span>
                        )}
                    </div>
                </div>
                <div className="address-form-body">
                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                            <Input 
                                placeholder="Họ và tên" 
                                prefix={<div className="input-icon-box"><UserOutlined /></div>} 
                            />
                        </Form.Item>
                        
                        <Form.Item name="phone" rules={[{ required: true, message: 'Vui lòng nhập số điện thoại' }]}>
                            <Input 
                                placeholder="Số điện thoại" 
                                prefix={<div className="input-icon-box"><PhoneOutlined /></div>} 
                            />
                        </Form.Item>

                        <div className="select-with-icon">
                            <div className="input-icon-box"><EnvironmentOutlined /></div>
                            <Form.Item name="province" rules={[{ required: true, message: 'Vui lòng nhập Tỉnh/Thành' }]} style={{ marginBottom: 0 }}>
                                <Input placeholder="Tỉnh/Thành" />
                            </Form.Item>
                        </div>

                        <div className="select-with-icon">
                            <div className="input-icon-box"><EnvironmentOutlined /></div>
                            <Form.Item name="district" rules={[{ required: true, message: 'Vui lòng nhập Quận/Huyện' }]} style={{ marginBottom: 0 }}>
                                <Input placeholder="Quận/Huyện" />
                            </Form.Item>
                        </div>

                        <div className="select-with-icon">
                            <div className="input-icon-box"><EnvironmentOutlined /></div>
                            <Form.Item name="ward" rules={[{ required: true, message: 'Vui lòng nhập Phường/Xã' }]} style={{ marginBottom: 0 }}>
                                <Input placeholder="Phường/Xã" />
                            </Form.Item>
                        </div>

                        <Form.Item name="detail" rules={[{ required: true, message: 'Vui lòng nhập địa chỉ chi tiết' }]}>
                            <Input 
                                placeholder="Địa chỉ chi tiết" 
                                prefix={<div className="input-icon-box"><HomeOutlined /></div>} 
                            />
                        </Form.Item>

                        <div className="address-form-actions">
                            <Button type="primary" htmlType="submit" className="btn-update">
                                {isUpdate ? 'CẬP NHẬT' : 'THÊM MỚI'}
                            </Button>
                            <Button type="default" onClick={onCancel} className="btn-cancel">
                                HỦY
                            </Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    };

    const AddressCard = ({ addr }) => (
        <div className="address-card">
            <div className="address-card-header">
                <div className="name">
                    {addr.fullName}
                </div>
                <div className="address-card-actions">
                    <span onClick={() => handleEdit(addr.id)} title="Sửa"><EditOutlined /></span>
                    <Popconfirm
                        title="Bạn có chắc chắn muốn xóa địa chỉ này?"
                        onConfirm={() => handleDelete(addr.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <span title="Xóa"><CloseOutlined /></span>
                    </Popconfirm>
                </div>
            </div>
            <div className="address-card-body">
                <div className="address-info-row">
                    <div className="address-info-label">Họ Tên:</div>
                    <div className="address-info-value">{addr.fullName}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Địa chỉ:</div>
                    <div className="address-info-value">{addr.detail}, {addr.ward || ''} {addr.district || ''} {addr.province}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Số điện thoại:</div>
                    <div className="address-info-value">{addr.phone}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="address-list-container">
            {contextHolder}
            <div className="address-list-title">
                <h1>Thông tin địa chỉ</h1>
                <div className="title-underline"></div>
            </div>

            <Row gutter={[40, 30]}>
                <Col xs={24} md={5}>
                    <Sidebar />
                </Col>
                <Col xs={24} md={19}>
                    <Row gutter={[20, 20]}>
                        {addresses.map(addr => (
                            <Col xs={24} lg={12} key={addr.id}>
                                {editingId === addr.id ? (
                                    <AddressFormInline 
                                        initialValues={addr} 
                                        onFinish={handleSubmit} 
                                        onCancel={handleCancel}
                                        isUpdate={true}
                                        onEditClick={() => handleEdit(addr.id)}
                                        onDeleteClick={() => handleDelete(addr.id)}
                                        addrId={addr.id}
                                    />
                                ) : (
                                    <AddressCard addr={addr} />
                                )}
                            </Col>
                        ))}
                        
                        <Col xs={24} lg={12}>
                            {isAdding ? (
                                <AddressFormInline 
                                    onFinish={handleSubmit} 
                                    onCancel={handleCancel}
                                    isUpdate={false}
                                />
                            ) : (
                                <Button 
                                    className="btn-add-new-address" 
                                    type="primary"
                                    onClick={handleAddNew}
                                >
                                    NHẬP ĐỊA CHỈ MỚI
                                </Button>
                            )}
                        </Col>
                    </Row>
                </Col>
            </Row>
        </div>
    );
};

export default AddressList;
