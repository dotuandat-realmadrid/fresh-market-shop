import React, { useState, useEffect } from 'react';
import { Row, Col, Button, message, Input, Form, DatePicker } from 'antd';
import { 
    EditOutlined, 
    UserOutlined, 
    CalendarOutlined, 
    PhoneOutlined,
    KeyOutlined,
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { logout, setUserInfo } from '../../reducers/userReducer';
import { getMyInfo, updateUser } from '../../api/user';
import { changePassword } from '../../api/password';
import './AddressList.css'; // Reusing AddressList styles

const MyProfile = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPass, setIsChangingPass] = useState(false);

    const fetchUserInfo = async () => {
        try {
            const token = localStorage.getItem('token');
            if (token) {
                dispatch(getMyInfo(token));
            }
        } catch (error) {
            console.error("Fetch user info error:", error);
        }
    };

    useEffect(() => {
        if (!user.id) {
            navigate('/login');
        } else {
            fetchUserInfo();
        }
    }, [user.id]);

    const handleLogout = () => {
        dispatch(logout());
        localStorage.removeItem('token');
        navigate('/login');
        message.success('Đăng xuất thành công');
    };

    const handleEdit = () => {
        setIsEditing(true);
        setIsChangingPass(false);
    };

    const handleChangePass = () => {
        setIsChangingPass(true);
        setIsEditing(false);
    };

    const handleCancel = () => {
        setIsEditing(false);
        setIsChangingPass(false);
    };

    const handleSubmit = async (values) => {
        try {
            const currentUsername = user.username;
            if (!currentUsername) {
                message.error("Thiếu thông tin người dùng!");
                return;
            }

            const payload = {
                ...values,
                username: currentUsername,
                roles: user.roles,
                isGuest: user.isGuest,
                gender: user.gender,
                dob: values.dob ? dayjs(values.dob).format('YYYY-MM-DD') : null
            };
            
            const updatedUser = await updateUser(payload, user.id);
            if (updatedUser) {
                dispatch(setUserInfo(updatedUser)); 
                setIsEditing(false);
            }
        } catch (error) {
            console.error("Update profile error:", error);
            message.error("Cập nhật thất bại. Vui lòng thử lại!");
        }
    };

    const handleChangePassSubmit = async (values) => {
        if (values.newPassword !== values.confirmPassword) {
            message.error("Mật khẩu mới và mật khẩu nhập lại không khớp!");
            return;
        }
        try {
            await changePassword({
                oldPassword: values.oldPassword,
                newPassword: values.newPassword
            });
            setIsChangingPass(false);
        } catch (error) {
            console.error("Change password error:", error);
            message.error("Đổi mật khẩu thất bại!");
        }
    };

    const Sidebar = () => (
        <div className="account-sidebar">
            <h2 className="sidebar-title">TÀI KHOẢN</h2>
            <ul className="account-sidebar-menu">
                <li>
                    <Link to="/my-profile" className="active">
                        <span className="sidebar-icon"></span>
                        Thông tin tài khoản
                    </Link>
                </li>
                <li>
                    <Link to="/my-address">
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

    const ProfileHeader = () => (
        <div className="address-card-header">
            <div className="name">{user.fullName || 'ADMIN'}</div>
            <div className="address-card-actions">
                <span onClick={handleEdit} title="Sửa"><EditOutlined /></span>
                <span onClick={handleChangePass} title="Đổi mật khẩu"><KeyOutlined /></span>
            </div>
        </div>
    );

    const ProfileFormInline = ({ initialValues, onFinish, onCancel }) => {
        const [form] = Form.useForm();

        useEffect(() => {
            form.setFieldsValue({
                ...initialValues,
                dob: initialValues.dob ? dayjs(initialValues.dob) : null
            });
        }, [initialValues, form]);

        return (
            <div className="address-form-inline">
                <ProfileHeader />
                <div className="address-form-body">
                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Form.Item name="fullName" rules={[{ required: true, message: 'Vui lòng nhập họ tên' }]}>
                            <Input placeholder="Họ và tên" prefix={<div className="input-icon-box"><UserOutlined /></div>} />
                        </Form.Item>
                        <Form.Item name="phone">
                            <Input placeholder="Số điện thoại" prefix={<div className="input-icon-box"><PhoneOutlined /></div>} />
                        </Form.Item>
                        <Form.Item name="dob" rules={[{ required: true, message: 'Vui lòng chọn ngày sinh' }]}>
                            <DatePicker 
                                placeholder="Ngày sinh" 
                                style={{ width: '100%' }}
                                format="YYYY-MM-DD"
                                disabledDate={(current) => current && current > dayjs().endOf('day')}
                                suffixIcon={<div className="input-icon-box" style={{ borderRight: 'none', borderLeft: '1px solid #d9d9d9' }}><CalendarOutlined /></div>}
                            />
                        </Form.Item>
                        <div className="address-form-actions">
                            <Button type="primary" htmlType="submit" className="btn-update">CẬP NHẬT</Button>
                            <Button type="default" onClick={onCancel} className="btn-cancel">HỦY</Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    };

    const ChangePasswordForm = ({ onFinish, onCancel }) => {
        const [form] = Form.useForm();
        return (
            <div className="address-form-inline">
                <ProfileHeader />
                <div className="address-form-body">
                    <Form form={form} onFinish={onFinish} layout="vertical">
                        <Form.Item name="oldPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu cũ' }]}>
                            <Input.Password placeholder="Mật khẩu cũ" prefix={<div className="input-icon-box"><KeyOutlined /></div>} />
                        </Form.Item>
                        <Form.Item name="newPassword" rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới' }]}>
                            <Input.Password placeholder="Mật khẩu mới" prefix={<div className="input-icon-box"><KeyOutlined /></div>} />
                        </Form.Item>
                        <Form.Item 
                            name="confirmPassword" 
                            rules={[
                                { required: true, message: 'Vui lòng nhập lại mật khẩu mới' },
                                ({ getFieldValue }) => ({
                                    validator(_, value) {
                                      if (!value || getFieldValue('newPassword') === value) {
                                        return Promise.resolve();
                                      }
                                      return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                                    },
                                  }),
                            ]}
                        >
                            <Input.Password placeholder="Nhập lại mật khẩu mới" prefix={<div className="input-icon-box"><KeyOutlined /></div>} />
                        </Form.Item>
                        <div className="address-form-actions">
                            <Button type="primary" htmlType="submit" className="btn-update">LƯU THAY ĐỔI</Button>
                            <Button type="default" onClick={onCancel} className="btn-cancel">HỦY</Button>
                        </div>
                    </Form>
                </div>
            </div>
        );
    };

    const ProfileView = () => (
        <div className="address-card">
            <ProfileHeader />
            <div className="address-card-body">
                <div className="address-info-row">
                    <div className="address-info-label">Họ tên:</div>
                    <div className="address-info-value">{user.fullName || 'ADMIN'}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Email:</div>
                    <div className="address-info-value">{user.username || 'admin@gmail.com'}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Ngày sinh:</div>
                    <div className="address-info-value">{user.dob ? dayjs(user.dob).format('YYYY-MM-DD') : ''}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Số điện thoại:</div>
                    <div className="address-info-value">{user.phone}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Vai trò:</div>
                    <div className="address-info-value">{(user.roles || []).join(', ')}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Ngày tạo:</div>
                    <div className="address-info-value">{user.createdDate ? dayjs(user.createdDate).format('HH:mm:ss DD/MM/YYYY') : ''}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Người tạo:</div>
                    <div className="address-info-value">{user.createdBy}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Ngày cập nhật:</div>
                    <div className="address-info-value">{user.modifiedDate ? dayjs(user.modifiedDate).format('HH:mm:ss DD/MM/YYYY') : ''}</div>
                </div>
                <div className="address-info-row">
                    <div className="address-info-label">Người cập nhật:</div>
                    <div className="address-info-value">{user.modifiedBy}</div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="address-list-container">
            <div className="address-list-title">
                <h1>Thông tin tài khoản</h1>
                <div className="title-underline"></div>
            </div>

            <Row gutter={[40, 30]}>
                <Col xs={24} md={5}>
                    <Sidebar />
                </Col>
                <Col xs={24} md={10}>
                    <Row gutter={[20, 20]}>
                        <Col xs={24} lg={24}>
                            {isEditing ? (
                                <ProfileFormInline 
                                    initialValues={user} 
                                    onFinish={handleSubmit} 
                                    onCancel={handleCancel}
                                />
                            ) : isChangingPass ? (
                                <ChangePasswordForm 
                                    onFinish={handleChangePassSubmit}
                                    onCancel={handleCancel}
                                />
                            ) : (
                                <ProfileView />
                            )}
                        </Col>
                    </Row>
                </Col>
                <Col xs={24} md={9}></Col>
            </Row>
        </div>
    );
};

export default MyProfile;
