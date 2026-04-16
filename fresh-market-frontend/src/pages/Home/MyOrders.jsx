import React, { useState, useEffect } from 'react';
import { Row, Col, Button, message, Tabs, Empty, Spin, Popconfirm, Modal, Table, Badge, Rate, Input, Select, Radio, Steps, Space, Divider } from 'antd';
import { 
    ShoppingOutlined,
    UserOutlined,
    PhoneOutlined,
    CalendarOutlined,
    FileTextOutlined,
    CheckCircleOutlined,
    CloseCircleOutlined,
    CheckCircleFilled,
    CloseCircleFilled,
    LoadingOutlined,
    CreditCardOutlined,
    EnvironmentOutlined,
    MailOutlined
} from '@ant-design/icons';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import { getOrdersByUser, cancelOrder, getOneByOrderId } from '../../api/order';
import { createRefund } from '../../api/refund';
import { createReview } from '../../api/review';
import CustomPagination from '../../components/CustomPagination/CustomPagination';
import './AddressList.css'; 
import './MyOrders.css';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';

const { TextArea } = Input;
const { Step } = Steps;

const MyOrders = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const user = useSelector((state) => state.user);

    
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [totalOrders, setTotalOrders] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [activeStatus, setActiveStatus] = useState('PENDING');
    const pageSize = 5;

    // Modals visibility
    const [detailModalVisible, setDetailModalVisible] = useState(false);
    const [refundModalVisible, setRefundModalVisible] = useState(false);
    const [reviewModalVisible, setReviewModalVisible] = useState(false);
    
    // Modals data
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [refundData, setRefundData] = useState({ code: '02', reason: '', otherReason: '', amount: 0 });
    const [reviewData, setReviewData] = useState({ productId: '', rating: 0, title: '', comment: '', productName: '', itemImg: '', price: 0 });

    const statuses = [
        { key: 'PENDING', label: 'Đang chờ xử lý' },
        { key: 'CANCELLED', label: 'Đã hủy' },
        { key: 'CONFIRMED', label: 'Đã xác nhận' },
        { key: 'SHIPPING', label: 'Đang giao hàng' },
        { key: 'COMPLETED', label: 'Đã hoàn thành' },
        { key: 'FAILED', label: 'Giao hàng thất bại' },
    ];

    const fetchOrders = async (status, page) => {
        if (!user.id) return;
        setLoading(true);
        try {
            const result = await getOrdersByUser(user.id, status, page, pageSize);
            setOrders(result.data || []);
            setTotalOrders(result.totalElements || 0);
        } catch (error) {
            console.error("Fetch orders error:", error);
            message.error("Không thể tải danh sách đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (user.id) {
            fetchOrders(activeStatus, currentPage);
        } else {
            navigate('/login');
        }
    }, [user.id, activeStatus, currentPage]);

    const handleTabChange = (key) => {
        setActiveStatus(key);
        setCurrentPage(1);
    };

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    // Actions
    const handleCancelOrder = async (orderId) => {
        try {
            await cancelOrder(orderId);
            message.success("Đã hủy đơn hàng thành công");
            fetchOrders(activeStatus, currentPage);
            setDetailModalVisible(false);
        } catch (error) {
            message.error(error.message || "Không thể hủy đơn hàng");
        }
    };

    const handleOpenDetail = async (orderId) => {
        try {
            setLoading(true);
            const result = await getOneByOrderId(orderId);
            setSelectedOrder(result);
            setDetailModalVisible(true);
        } catch (error) {
            message.error("Không thể lấy chi tiết đơn hàng");
        } finally {
            setLoading(false);
        }
    };

    const handleOpenRefund = (order) => {
        setSelectedOrder(order);
        setRefundData({ code: '02', reason: '', otherReason: '', amount: order.totalPrice });
        setRefundModalVisible(true);
    };

    const handleOpenReview = (item, order) => {
        setSelectedOrder(order);
        setReviewData({ 
            productId: item.productId, 
            rating: 0, 
            title: '', 
            comment: '', 
            productName: item.productName,
            itemImg: item.imageUrl ? IMAGE_URL + '/' + item.imageUrl : (item.images?.[0] ? IMAGE_URL + '/' + item.images[0] : DEFAULT_IMAGE),
            price: item.price || item.priceAtPurchase || 0
        });
        setReviewModalVisible(true);
    };

    const submitRefundForm = async () => {
        const { code, reason, otherReason, amount } = refundData;
        const finalReason = reason === 'Khác' ? otherReason : reason;
        
        if (!finalReason) {
            message.warning("Vui lòng chọn hoặc nhập lý do hoàn tiền");
            return;
        }

        try {
            const payload = {
                code,
                userId: user.id,
                orderId: selectedOrder.id,
                refundAmount: amount,
                reason: finalReason,
                note: ''
            };
            const result = await createRefund(payload);
            if (result.code === 1000) {
                message.success("Gửi yêu cầu hoàn tiền thành công!");
                setRefundModalVisible(false);
                if (selectedOrder.status === 'PENDING') {
                    await cancelOrder(selectedOrder.id).catch(() => {});
                }
                fetchOrders(activeStatus, currentPage);
            }
        } catch (error) {
            message.error(error.message || "Lỗi khi gửi yêu cầu hoàn tiền");
        }
    };

    const submitReviewForm = async () => {
        if (reviewData.rating === 0) {
            message.warning("Vui lòng chọn số sao đánh giá");
            return;
        }

        try {
            const payload = {
                username: user.username,
                orderId: selectedOrder.id,
                productId: reviewData.productId,
                rating: reviewData.rating,
                title: reviewData.title,
                comment: reviewData.comment
            };
            await createReview(payload);
            message.success("Đánh giá sản phẩm thành công!");
            setReviewModalVisible(false);
            handleOpenDetail(selectedOrder.id);
            fetchOrders(activeStatus, currentPage);
        } catch (error) {
            message.error(error.message || "Lỗi khi gửi đánh giá");
        }
    };

    const getStatusStep = (status) => {
        switch (status) {
            case 'PENDING': return 1;
            case 'CONFIRMED': return 2;
            case 'SHIPPING': return 3;
            case 'COMPLETED': return 4;
            case 'FAILED': return 1;
            case 'CANCELLED': return 1;
            default: return 0;
        }
    };

    const getStatusText = (status) => {
        const s = statuses.find(x => x.key === status);
        return s ? s.label : status;
    };

    const getBadgeStatus = (status) => {
        switch (status) {
            case 'PENDING': return 'processing';
            case 'CONFIRMED': return 'warning';
            case 'SHIPPING': return 'processing';
            case 'COMPLETED': return 'success';
            case 'FAILED': return 'error';
            case 'CANCELLED': return 'default';
            default: return 'default';
        }
    };

    const Sidebar = () => (
        <div className="account-sidebar">
            <h2 className="sidebar-title">TÀI KHOẢN</h2>
            <ul className="account-sidebar-menu">
                <li><Link to="/my-profile">Thông tin tài khoản</Link></li>
                <li><Link to="/my-address">Danh sách địa chỉ</Link></li>
                <li><Link to="/my-orders" className="active">Đơn hàng của tôi</Link></li>
            </ul>
        </div>
    );

    const OrderCard = ({ order }) => (
        <div className="order-card" onClick={() => handleOpenDetail(order.id)}>
            <Row align="middle">
                <Col xs={24} md={5} className="order-info-section">
                    <div className="order-status-id">
                        <Badge status={getBadgeStatus(order.status)} text={getStatusText(order.status)} />
                        <div className="order-id">#{order.id}</div>
                    </div>
                    <div className="customer-mini-info">
                        <div><UserOutlined /> {order.fullName || user.fullName}</div>
                        <div><PhoneOutlined /> {order.phone || user.phone}</div>
                    </div>
                </Col>
                <Col xs={24} md={14} className="order-items-section">
                    <div className="order-items-list-scroll">
                        {(order.orderItems || order.details || []).map((item, idx) => (
                            <div key={idx} className="order-item-row-compact">
                                <img 
                                    src={item.imageUrl ? IMAGE_URL + '/' + item.imageUrl : (item.images?.[0] ? IMAGE_URL + '/' + item.images[0] : DEFAULT_IMAGE)} 
                                    alt="" 
                                    className="compact-img" 
                                />
                                <div className="compact-details">
                                    <div className="compact-name bold">{item.productName}</div>
                                    <div className="compact-info-row">
                                        <span className="p-code text-muted small">Mã: {item.productCode || item.sku || 'N/A'}</span>
                                    </div>
                                    <div className="compact-price-qty">
                                        <span className="price">{(item.priceAtPurchase || item.price || 0).toLocaleString('vi-VN')}đ</span>
                                        <span className="qty"> x{item.quantity}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </Col>
                <Col xs={24} md={5} className="order-actions-section">
                    <div className="action-buttons" onClick={(e) => e.stopPropagation()}>
                        {order.status === 'PENDING' && (
                            <>
                                <Popconfirm title="Hủy đơn?" onConfirm={() => handleCancelOrder(order.id)}>
                                    <Button danger size="small" className="btn-action-custom">Hủy đơn hàng</Button>
                                </Popconfirm>
                                {order.paymentMethod && order.paymentMethod !== 'COD' && (
                                    <Button className="btn-refund-custom" size="small" onClick={() => handleOpenRefund(order)}>Yêu cầu hoàn tiền</Button>
                                )}
                            </>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );

    return (
        <div className="address-list-container">

            <div className="address-list-title">
                <h1>Thông tin đơn hàng</h1>
                <div className="title-underline"></div>
            </div>

            <Row gutter={[40, 30]}>
                <Col xs={24} md={5}><Sidebar /></Col>
                <Col xs={24} md={19}>
                    <div className="orders-content-wrapper">
                        <Tabs 
                            activeKey={activeStatus} 
                            onChange={handleTabChange} 
                            className={`order-status-tabs status-${activeStatus}`}
                            centered
                            items={statuses.map(s => {
                                let color = '#666'; // Default color
                                if (activeStatus === s.key) {
                                    if (s.key === 'CANCELLED' || s.key === 'FAILED') color = '#ff4d4f';
                                    else if (s.key === 'COMPLETED') color = '#52c41a';
                                    else if (s.key === 'PENDING') color = '#1890ff';
                                    else if (s.key === 'CONFIRMED') color = '#faad14';
                                    else if (s.key === 'SHIPPING') color = '#13c2c2';
                                    else color = '#3CB815'; // Fallback to theme green
                                }
                                return {
                                    key: s.key,
                                    label: <span style={{ color: color, fontWeight: activeStatus === s.key ? '600' : 'normal' }}>{s.label}</span>
                                };
                            })}
                        />

                        <div className="orders-list-summary">Tổng số: {totalOrders} đơn hàng</div>

                        {loading && orders.length === 0 ? <div className="loading-spinner"><Spin size="large" /></div> : orders.length > 0 ? (
                            <div className="orders-container">
                                {orders.map(order => <OrderCard key={order.id} order={order} />)}
                                <div className="pagination-wrapper">
                                    <CustomPagination total={totalOrders} current={currentPage} pageSize={pageSize} onChange={handlePageChange} layout='center' />
                                </div>
                            </div>
                        ) : (
                            <Empty 
                                image={Empty.PRESENTED_IMAGE_SIMPLE} 
                                description="Không có đơn hàng nào" 
                                className="empty-orders" 
                            />
                        )}
                    </div>
                </Col>
            </Row>

            {/* Detail Modal */}
            <Modal
                title={null}
                open={detailModalVisible}
                onCancel={() => setDetailModalVisible(false)}
                footer={null}
                width={850}
                className="order-detail-modal-modern"
                centered
            >
                {selectedOrder && (
                    <div className="modern-detail-wrapper">
                        <div className="modal-custom-header">
                            <div className="header-left">
                                <h3 className="modal-main-title">Chi tiết đơn hàng #{selectedOrder.id}</h3>
                                <Badge 
                                    className="status-badge-custom" 
                                    count={getStatusText(selectedOrder.status).toUpperCase()} 
                                    style={{ 
                                        backgroundColor: selectedOrder.status === 'PENDING' ? '#1890ff' : (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'FAILED' ? '#ff4d4f' : (selectedOrder.status === 'CONFIRMED' ? '#faad14' : (selectedOrder.status === 'SHIPPING' ? '#13c2c2' : '#3CB815'))),
                                        fontSize: '11px',
                                        fontWeight: '600',
                                        marginLeft: '15px'
                                    }} 
                                />
                            </div>
                        </div>

                        <div className="status-stepper-modern">
                            <Steps 
                                current={getStatusStep(selectedOrder.status)} 
                                size="small" 
                                labelPlacement="vertical"
                                status={['CANCELLED', 'FAILED'].includes(selectedOrder.status) ? 'error' : 'process'}
                                    items={[
                                        { 
                                            title: <span style={{ color: '#000', fontWeight: 500 }}>Đặt hàng</span>, 
                                            description: <span style={{ color: '#555' }}>Đặt hàng thành công</span>, 
                                            icon: (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'FAILED') && getStatusStep(selectedOrder.status) === 0 ? <CloseCircleFilled style={{ fontSize: '24px', color: '#ff4d4f' }} /> : <CheckCircleFilled style={{ fontSize: '24px' }} /> 
                                        },
                                        { 
                                            title: <span style={{ color: '#000', fontWeight: 500 }}>Xác nhận</span>, 
                                            description: <span style={{ color: '#555' }}>{selectedOrder.status === 'PENDING' ? 'Chờ xác nhận' : (['CANCELLED', 'FAILED'].includes(selectedOrder.status) ? 'Đã hủy' : 'Đã xác nhận')}</span>, 
                                            icon: (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'FAILED') ? <CloseCircleFilled style={{ fontSize: '24px', color: '#ff4d4f' }} /> : (getStatusStep(selectedOrder.status) >= 2 ? <CheckCircleFilled style={{ fontSize: '24px' }} /> : null)
                                        },
                                        { 
                                            title: <span style={{ color: '#000', fontWeight: 500 }}>Vận chuyển</span>, 
                                            description: <span style={{ color: '#555' }}>{['PENDING', 'CONFIRMED'].includes(selectedOrder.status) ? 'Chờ giao hàng' : (['CANCELLED', 'FAILED'].includes(selectedOrder.status) ? 'Đã hủy' : 'Đang giao hàng')}</span>, 
                                            icon: (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'FAILED') ? <CloseCircleFilled style={{ fontSize: '24px', color: '#ff4d4f' }} /> : (getStatusStep(selectedOrder.status) >= 3 ? <CheckCircleFilled style={{ fontSize: '24px' }} /> : null)
                                        },
                                        { 
                                            title: <span style={{ color: '#000', fontWeight: 500 }}>Hoàn thành</span>, 
                                            description: <span style={{ color: '#555' }}>{selectedOrder.status === 'COMPLETED' ? 'Đã hoàn thành' : (['CANCELLED', 'FAILED'].includes(selectedOrder.status) ? (selectedOrder.status === 'CANCELLED' ? 'Đã hủy' : 'Giao hàng thất bại') : 'Chờ nhận hàng')}</span>, 
                                            icon: (selectedOrder.status === 'CANCELLED' || selectedOrder.status === 'FAILED') ? <CloseCircleFilled style={{ fontSize: '24px', color: '#ff4d4f' }} /> : (getStatusStep(selectedOrder.status) >= 4 ? <CheckCircleFilled style={{ fontSize: '24px' }} /> : null)
                                        }
                                    ]}
                            />
                        </div>

                        <Row gutter={24} className="info-section-grid">
                            <Col span={12}>
                                <div className="info-block-styled">
                                    <div className="block-title-styled">Thông tin khách hàng</div>
                                    <div className="block-body-styled">
                                        <div className="body-row-styled"><span className="label-styled">Họ và tên:</span> <span className="val-styled">{selectedOrder.fullName}</span></div>
                                        <div className="body-row-styled"><span className="label-styled">Email:</span> <span className="val-styled">{selectedOrder.username}</span></div>
                                        <div className="body-row-styled"><span className="label-styled">Số điện thoại:</span> <span className="val-styled">{selectedOrder.phone}</span></div>
                                        <div className="body-row-styled"><span className="label-styled">Địa chỉ:</span> <span className="val-styled">{selectedOrder.address}</span></div>
                                    </div>
                                </div>
                            </Col>
                            <Col span={12}>
                                <div className="info-block-styled">
                                    <div className="block-title-styled">Thông tin đơn hàng</div>
                                    <div className="block-body-styled">
                                        <div className="body-row-styled"><span className="label-styled">Phương thức thanh toán:</span> <span className="val-styled">{selectedOrder.paymentMethod || 'COD'}</span></div>
                                        <div className="body-row-styled"><span className="label-styled">Tổng tiền:</span> <span className="val-styled red bold">{selectedOrder.totalPrice.toLocaleString()}đ</span></div>
                                        <div className="body-row-styled"><span className="label-styled">Ghi chú:</span> <span className="val-styled">{selectedOrder.note || 'Không có'}</span></div>
                                        <div className="body-row-styled"><span className="label-styled">Ngày tạo:</span> <span className="val-styled">{selectedOrder.createdDate}</span></div>
                                    </div>
                                </div>
                            </Col>
                        </Row>

                        <div className="product-table-modern">
                            <h6 className="table-heading">Danh sách sản phẩm</h6>
                            <Table
                                dataSource={selectedOrder.orderItems || selectedOrder.details || []}
                                pagination={false}
                                size="middle"
                                rowKey={(record) => record.productId || record.sku || record.id || Math.random()}
                                columns={[
                                    {
                                        title: 'Tên sản phẩm',
                                        render: (_, record) => (
                                            <div className="table-product-item">
                                                <img src={record.imageUrl ? IMAGE_URL + '/' + record.imageUrl : (record.images?.[0] ? IMAGE_URL + '/' + record.images[0] : DEFAULT_IMAGE)} alt="" />
                                                <div className="p-text">
                                                    <div className="p-title">{record.productName}</div>
                                                    <div className="p-code-small">Mã: {record.sku || record.productCode}</div>
                                                </div>
                                            </div>
                                        )
                                    },
                                    { title: 'Số lượng', dataIndex: 'quantity', align: 'center', render: (q) => <div className="qty-badge-square">{q}</div> },
                                    { title: 'Giá', render: (_, r) => `${(r.price || r.priceAtPurchase).toLocaleString()}đ`, align: 'right' },
                                    { title: 'Thành tiền', render: (_, r) => <span className="red-bold">{((r.price || r.priceAtPurchase) * r.quantity).toLocaleString()}đ</span>, align: 'right' },
                                    {
                                        title: 'Đánh giá',
                                        align: 'center',
                                        render: (_, r) => selectedOrder.status === 'COMPLETED' ? (
                                            r.isReviewed ? <span className="text-muted">Đã đánh giá</span> : 
                                            <Button className="btn-green-eval" type="primary" size="middle" onClick={() => handleOpenReview(r, selectedOrder)}>Đánh giá</Button>
                                        ) : null
                                    }
                                ]}
                            />
                            <div className="order-total-summary">
                                Tổng cộng: <span className="total-amount-red">{selectedOrder.totalPrice.toLocaleString()}đ</span>
                            </div>
                        </div>

                        <Divider />
                        <div className="modal-action-footer-end">
                            <Space size="middle">
                                {selectedOrder.status === 'PENDING' && (
                                    <Popconfirm title="Bạn có chắc muốn hủy đơn hàng này?" onConfirm={() => handleCancelOrder(selectedOrder.id)} okText="Đồng ý" cancelText="Hủy">
                                        <Button danger size="middle" className="btn-cancel-outline">Hủy đơn hàng</Button>
                                    </Popconfirm>
                                )}
                                <Button type="primary" size="middle" onClick={() => setDetailModalVisible(false)} className="btn-black-close">Đóng</Button>
                            </Space>
                        </div>
                    </div>
                )}
            </Modal>

            {/* Refund Modal */}
            <Modal
                title="Yêu cầu hoàn tiền"
                open={refundModalVisible}
                onCancel={() => setRefundModalVisible(false)}
                onOk={submitRefundForm}
                okText="Gửi yêu cầu"
                cancelText="Đóng"
                centered
            >
                <div className="form-group mb-3">
                    <label className="bold mb-1">Loại giao dịch</label>
                    <Select value={refundData.code} onChange={(v) => setRefundData({...refundData, code: v})} style={{width: '100%'}}>
                        <Select.Option value="02">Hoàn tiền toàn phần</Select.Option>
                        <Select.Option value="03">Hoàn tiền một phần</Select.Option>
                    </Select>
                </div>
                <div className="form-group mb-3">
                    <label className="bold mb-1">Số tiền hoàn</label>
                    <Input type="number" value={refundData.amount} onChange={(e) => setRefundData({...refundData, amount: e.target.value})} prefix={<CreditCardOutlined />} />
                </div>
                <div className="form-group mb-3">
                    <label className="bold mb-1 d-block text-start">Lý do hoàn tiền</label>
                    <Radio.Group style={{textAlign: 'left'}} value={refundData.reason} onChange={(e) => setRefundData({...refundData, reason: e.target.value})}>
                        <Space orientation="vertical" style={{textAlign: 'left', display: 'flex', alignItems: 'flex-start'}}>
                            <Radio value="Sản phẩm lỗi">Sản phẩm lỗi</Radio>
                            <Radio value="Không đúng mô tả">Không đúng mô tả</Radio>
                            <Radio value="Muốn đổi hàng">Muốn đổi hàng</Radio>
                            <Radio value="Khác">Khác</Radio>
                        </Space>
                    </Radio.Group>
                    {refundData.reason === 'Khác' && (
                        <TextArea rows={3} className="mt-2" placeholder="Nhập lý do khác..." value={refundData.otherReason} onChange={(e) => setRefundData({...refundData, otherReason: e.target.value})} />
                    )}
                </div>
            </Modal>

            <Modal
                title={
                    <div className="modal-title-custom">
                        <span className="star-emoji">⭐</span>
                        <span>Đánh giá sản phẩm</span>
                    </div>
                }
                open={reviewModalVisible}
                onCancel={() => setReviewModalVisible(false)}
                onOk={submitReviewForm}
                okText="Gửi đánh giá"
                cancelText="Hủy"
                centered
                width={500}
                className="modern-review-modal"
            >
                <div className="review-modal-content">
                    <div className="review-product-box">
                        <img src={reviewData.itemImg} alt="" />
                        <div className="p-details">
                            <div className="p-name">{reviewData.productName}</div>
                            <div className="p-sku">Mã: {reviewData.productId}</div>
                            <div className="p-price">Giá: <span className="red-text">{reviewData.price.toLocaleString()}đ</span></div>
                        </div>
                    </div>

                    <div className="stars-section text-center">
                        <Rate 
                            value={reviewData.rating} 
                            onChange={(v) => setReviewData({...reviewData, rating: v})} 
                            style={{ fontSize: 24, color: '#faad14' }}
                        />
                        <div className="stars-label">
                            {reviewData.rating === 0 ? 'Hãy đánh giá sản phẩm' : (
                                reviewData.rating === 1 || reviewData.rating === 2 ? 'Không hài lòng' : 
                                reviewData.rating === 3 ? 'Bình thường' : 
                                reviewData.rating === 4 ? 'Hài lòng' : 'Rất hài lòng'
                            )}
                        </div>
                    </div>

                    <div className="review-form-body">
                        <div className="form-item">
                            <label className="form-label">Tiêu đề đánh giá</label>
                            <Input 
                                placeholder="Nhập tiêu đề đánh giá..." 
                                value={reviewData.title} 
                                onChange={(e) => setReviewData({...reviewData, title: e.target.value})} 
                            />
                        </div>

                        <div className="form-item mt-3">
                            <label className="form-label">Nội dung đánh giá</label>
                            <TextArea 
                                rows={4} 
                                maxLength={500} 
                                placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..." 
                                value={reviewData.comment} 
                                onChange={(e) => setReviewData({...reviewData, comment: e.target.value})} 
                            />
                            <div className="char-count">{reviewData.comment.length} / 500</div>
                        </div>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default MyOrders;
