import {
  StarFilled,
  StarOutlined,
  CheckCircleFilled,
  ClockCircleFilled,
  SendOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Card,
  Descriptions,
  Divider,
  Form,
  Input,
  message,
  Modal,
  Popconfirm,
  Rate,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  Steps,
  Timeline,
  Row,
  Col,
  Breadcrumb,
} from "antd";
import MyButton from "./MyButton";
import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { getOneByOrderId, updateOrderStatus } from "../api/order";
import { createReview } from "../api/review";
import { getToken } from "../services/localStorageService";
import { DEFAULT_IMAGE, IMAGE_URL } from "../api/auth";
import "../pages/Admin/AccountAdmin.css";

const { Text, Title } = Typography;
const { TextArea } = Input;

// Define prop types for component
// isAdminView: boolean - determines if the component is being viewed by an admin
export default function OrderDetailComponent({
  isAdminView = false,
  initialOrderData = null,
}) {
  const { orderId } = useParams();
  const [order, setOrder] = useState(initialOrderData);
  const [loading, setLoading] = useState(!initialOrderData);
  const [nextStatus, setNextStatus] = useState(null);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form] = Form.useForm();
  const [ratingSubmitting, setRatingSubmitting] = useState(false);
  const [hoverRating, setHoverRating] = useState(0);
  const user = useSelector((state) => state.user);
  const navigate = useNavigate();

  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  useEffect(() => {
    // Only fetch if initialOrderData is not provided
    if (!initialOrderData && orderId) {
      const fetchOrder = async () => {
        try {
          setLoading(true);
          const response = await getOneByOrderId(orderId);
          setOrder(response);
        } catch (error) {
          console.error("Lỗi khi lấy chi tiết đơn hàng:", error);
          message.error("Không thể tải chi tiết đơn hàng!");
        } finally {
          setLoading(false);
        }
      };
      fetchOrder();
    }
  }, [orderId, initialOrderData]);

  // Update order state when initialOrderData changes
  useEffect(() => {
    if (initialOrderData) {
      setOrder(initialOrderData);
      setLoading(false);
    }
  }, [initialOrderData]);

  // Handle status update
  const handleUpdateStatus = async () => {
    if (!order || !nextStatus) return;

    try {
      await updateOrderStatus(orderId, { status: nextStatus });
      setOrder((prev) => ({ ...prev, status: nextStatus }));
      setNextStatus(null);
      message.success(`Đã cập nhật trạng thái thành ${nextStatus}`);
    } catch (error) {
      console.error("Lỗi khi cập nhật trạng thái:", error);
      message.error("Cập nhật trạng thái thất bại!");
    }
  };

  // Get next status options based on current status
  const getNextStatusOptions = (currentStatus) => {
    switch (currentStatus) {
      case "PENDING":
        return ["CONFIRMED", "CANCELLED"];
      case "CONFIRMED":
        return ["SHIPPING"];
      case "SHIPPING":
        return ["COMPLETED", "FAILED"];
      case "COMPLETED":
      case "CANCELLED":
      case "FAILED":
      default:
        return [];
    }
  };

  // Get color for status
  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "blue";
      case "CANCELLED":
        return "red";
      case "CONFIRMED":
        return "purple";
      case "SHIPPING":
        return "orange";
      case "COMPLETED":
        return "green";
      case "FAILED":
        return "volcano";
      default:
        return "default";
    }
  };

  // Get icon for status
  const getStatusIcon = (status) => {
    switch (status) {
      case "PENDING":
        return <ClockCircleFilled />;
      case "CONFIRMED":
        return <CheckCircleFilled />;
      case "SHIPPING":
        return <SendOutlined />;
      case "COMPLETED":
        return <CheckCircleFilled />;
      case "CANCELLED":
      case "FAILED":
      default:
        return <TagOutlined />;
    }
  };

  // Get current step in order process
  const getCurrentStep = (status) => {
    switch (status) {
      case "PENDING":
        return 0;
      case "CONFIRMED":
        return 1;
      case "SHIPPING":
        return 2;
      case "COMPLETED":
        return 3;
      case "CANCELLED":
      case "FAILED":
      default:
        return -1;
    }
  };

  // Rating descriptions
  const ratingDescriptions = [
    "Rất không hài lòng",
    "Không hài lòng",
    "Bình thường",
    "Hài lòng",
    "Rất hài lòng",
  ];

  // Open review modal for product
  const openReviewModal = (product) => {
    setSelectedProduct(product);
    form.resetFields();
    setReviewModalVisible(true);
  };

  // Submit product review
  const handleSubmitReview = async (values) => {
    if (!selectedProduct) return;

    if (!getToken()) {
      navigate("/login");
      message.error("Đăng nhập để đánh giá sản phẩm");
      return;
    }

    try {
      setRatingSubmitting(true);

      // Prepare review request data
      const reviewRequest = {
        userId: user.id,
        orderId: order.id,
        productId: selectedProduct.productId,
        rating: values.rating,
        comment: values.comment || null,
      };

      // Call the review API
      await createReview(reviewRequest);

      // Update UI after successful review submission
      const updatedDetails = order.details.map((item) => {
        if (item.productId === selectedProduct.productId) {
          return { ...item, isReviewed: true };
        }
        return item;
      });

      setOrder((prev) => ({ ...prev, details: updatedDetails }));
      form.resetFields();
      setReviewModalVisible(false);
    } catch (error) {
      console.error("Lỗi khi gửi đánh giá:", error);
      message.error("Không thể gửi đánh giá. Vui lòng thử lại sau!");
    } finally {
      setRatingSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "40px 40px" }}>
        <Typography.Title level={3}>
          Đang tải chi tiết đơn hàng...
        </Typography.Title>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ textAlign: "center", padding: "40px 40px" }}>
        <Typography.Title level={3}>Không tìm thấy đơn hàng!</Typography.Title>
      </div>
    );
  }

  const nextStatusOptions = getNextStatusOptions(order.status);
  const canReviewProducts = !isAdminView && order.status === "COMPLETED";
  const currentStep = getCurrentStep(order.status);

  // Configure product list columns based on view type
  const getProductColumns = () => {
    const baseColumns = [
      {
        title: "Tên sản phẩm",
        dataIndex: "productName",
        key: "productName",
        render: (_, record) => (
          <Space orientation="vertical" size={0}>
            <Space>
              <img
                src={
                  record.images && record.images.length !== 0
                    ? `${IMAGE_URL}/${record.images[0]}`
                    : DEFAULT_IMAGE
                }
                alt={record.productName}
                style={{
                  width: 50,
                  height: 50,
                  objectFit: "contain",
                  borderRadius: 4,
                }}
              />
              <Space orientation="vertical" size={0}>
                {isAdminPath ? (
                  <Link to={`/admin/products/${record.productCode}`}>
                    <Text strong>{record.productName}</Text>
                  </Link>
                ) : (
                  <Link to={`/products/${record.productCode}`}>
                    <Text strong>{record.productName}</Text>
                  </Link>
                )}
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Mã SP: {record.productCode}
                </Text>
              </Space>
            </Space>
            {!isAdminView && record.isReviewed && (
              <Space size={2} style={{ marginTop: 4, marginLeft: 48 }}>
                <StarFilled style={{ color: "#fadb14", fontSize: "14px" }} />
                <Text type="secondary" style={{ fontSize: "12px" }}>
                  Bạn đã đánh giá sản phẩm này
                </Text>
              </Space>
            )}
          </Space>
        ),
      },
      {
        title: "Số lượng",
        dataIndex: "quantity",
        key: "quantity",
        width: 100,
        align: "center",
        render: (quantity) => (
          <Badge
            count={quantity}
            showZero
            overflowCount={999}
            style={{ backgroundColor: "#1890ff", fontWeight: "bold" }}
          />
        ),
      },
      {
        title: "Giá",
        dataIndex: "priceAtPurchase",
        key: "priceAtPurchase",
        width: 150,
        align: "right",
        render: (price) => <Text strong>{price?.toLocaleString()}₫</Text>,
      },
      {
        title: "Thành tiền",
        key: "total",
        width: 150,
        align: "right",
        render: (_, record) => (
          <Text strong style={{ color: "#f5222d" }}>
            {(record.quantity * record.priceAtPurchase)?.toLocaleString()}₫
          </Text>
        ),
      },
    ];

    // Add review column only for user view
    if (!isAdminView) {
      baseColumns.push({
        title: "Đánh giá",
        key: "review",
        width: 150,
        align: "center",
        render: (_, record) => (
          <Space>
            {canReviewProducts && !record.isReviewed && (
              <MyButton
                type="primary"
                size="middle"
                icon={<StarOutlined />}
                onClick={() => openReviewModal(record)}
              >
                Đánh giá ngay
              </MyButton>
            )}

            {canReviewProducts && record.isReviewed && (
              <Badge
                color="green"
                text={
                  <Text type="success" style={{ fontWeight: "bold" }}>
                    Đã đánh giá
                  </Text>
                }
              />
            )}
          </Space>
        ),
      });
    }

    return baseColumns;
  };

  return (
    <>
      {!initialOrderData && (
        <>
          <div className="pagetitle mb-4">
            <h1>Chi tiết đơn hàng #{order.id}</h1>
            <nav>
              {isAdminPath ? (
                <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                  <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
                  <li className="breadcrumb-item"><Link to="/admin/orders">Quản lý đơn hàng</Link></li>
                  <li className="breadcrumb-item active">#{order.id}</li>
                </ol>
              ) : (
                <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
                  <li className="breadcrumb-item"><Link to="/">Trang chủ</Link></li>
                  <li className="breadcrumb-item"><Link to="/users">Thông tin tài khoản</Link></li>
                  <li className="breadcrumb-item"><Link to={`/orders/user/${user.id}/status/PENDING`}>Lịch sử đặt hàng</Link></li>
                  <li className="breadcrumb-item active">#{order.id}</li>
                </ol>
              )}
            </nav>
          </div>
        </>
      )}

      <Card
        style={{ marginBottom: 24, borderRadius: 8 }}
        title={
          <Space align="center">
            <Title
              level={3}
              style={{ margin: 0 }}
              copyable={{ text: order.id }}
            >
              Chi tiết đơn hàng #{order.id}
            </Title>
            <Tag
              color={getStatusColor(order.status)}
              style={{ marginLeft: 16, fontSize: 14, padding: "2px 12px" }}
              icon={getStatusIcon(order.status)}
            >
              {order.status}
            </Tag>
          </Space>
        }
      >
        {/* Order progress tracker - only show for normal flow */}
        {!["CANCELLED", "FAILED"].includes(order.status) && (
          <div style={{ margin: "0 0 24px 0" }}>
            <Steps
              current={currentStep}
              status={
                ["CANCELLED", "FAILED"].includes(order.status)
                  ? "error"
                  : "process"
              }
              items={[
                {
                  title: "Đặt hàng",
                  content: "Chờ xác nhận",
                },
                {
                  title: "Xác nhận",
                  content: "Đã xác nhận",
                },
                {
                  title: "Vận chuyển",
                  content: "Đang giao hàng",
                },
                {
                  title: "Hoàn thành",
                  content: "Đã giao hàng",
                },
              ]}
            />
          </div>
        )}

        <Row gutter={24}>
          {/* Customer Information */}
          <Col xs={24} md={12}>
            <Card
              title={<Text strong>Thông tin khách hàng</Text>}
              size="small"
              style={{ marginBottom: 16 }}
              variant="borderless"
              styles={{ header: { backgroundColor: "#f5f5f5" } }}
            >
              <Descriptions
                column={1}
                size="small"
                styles={{ label: { fontWeight: "bold" } }}
                colon={false}
              >
                <Descriptions.Item label="Họ và tên">
                  {order.fullName}
                </Descriptions.Item>
                <Descriptions.Item label="Email">
                  {order.username}
                </Descriptions.Item>
                <Descriptions.Item label="Số điện thoại">
                  {order.phone}
                </Descriptions.Item>
                <Descriptions.Item label="Địa chỉ">
                  {order.address || "Mua tại cửa hàng"}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>

          {/* Order Information */}
          <Col xs={24} md={12}>
            <Card
              title={<Text strong>Thông tin đơn hàng</Text>}
              size="small"
              style={{ marginBottom: 16 }}
              variant="borderless"
              styles={{ header: { backgroundColor: "#f5f5f5" } }}
            >
              <Descriptions
                column={1}
                size="small"
                styles={{ label: { fontWeight: "bold" } }}
                colon={false}
              >
                <Descriptions.Item label="Phương thức thanh toán">
                  {order.paymentMethod}
                </Descriptions.Item>
                <Descriptions.Item label="Tổng tiền">
                  <Text strong style={{ color: "#f5222d", fontSize: 16 }}>
                    {order.totalPrice?.toLocaleString()}₫
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="Ghi chú">
                  {order.note || "Không có"}
                </Descriptions.Item>
                <Descriptions.Item label="Ngày tạo">
                  {new Date(order.createdDate).toLocaleString()}
                </Descriptions.Item>
              </Descriptions>
            </Card>
          </Col>
        </Row>

        {/* Product list */}
        <div style={{ marginTop: 16 }}>
          <Card
            title={<Text strong>Danh sách sản phẩm</Text>}
            size="small"
            variant="borderless"
            styles={{ header: { backgroundColor: "#f5f5f5" } }}
          >
            <Table
              columns={getProductColumns()}
              dataSource={order.details}
              rowKey="productId"
              pagination={false}
              size="middle"
              bordered
              style={{ marginTop: 16 }}
              summary={(pageData) => {
                const total = pageData.reduce(
                  (acc, item) => acc + item.quantity * item.priceAtPurchase,
                  0
                );
                return (
                  <Table.Summary fixed>
                    <Table.Summary.Row>
                      <Table.Summary.Cell index={0} colSpan={3} align="right">
                        <Text strong>Tổng cộng:</Text>
                      </Table.Summary.Cell>
                      <Table.Summary.Cell index={1} align="right">
                        <Text strong style={{ color: "#f5222d", fontSize: 16 }}>
                          {total.toLocaleString()}₫
                        </Text>
                      </Table.Summary.Cell>
                      {!isAdminView && <Table.Summary.Cell index={2} />}
                    </Table.Summary.Row>
                  </Table.Summary>
                );
              }}
            />
          </Card>
        </div>

        {/* Status update buttons - only for admin */}
        {isAdminPath && (
          <Card
            title={<Text strong>Cập nhật trạng thái</Text>}
            size="small"
            style={{ marginTop: 16 }}
            variant="borderless"
            styles={{ header: { backgroundColor: "#f5f5f5" } }}
          >
            <Space orientation="vertical" size="middle" style={{ width: "100%" }}>
              <Timeline
                items={[
                  {
                    color: getStatusColor(order.status),
                    content: (
                      <Space>
                        <Text strong>Trạng thái hiện tại:</Text>
                        <Tag
                          color={getStatusColor(order.status)}
                          icon={getStatusIcon(order.status)}
                        >
                          {order.status}
                        </Tag>
                      </Space>
                    ),
                  },
                  {
                    color: nextStatus ? getStatusColor(nextStatus) : "gray",
                    content: (
                      <Space orientation="vertical" size="small">
                        <Text strong>Cập nhật trạng thái:</Text>
                        <Space>
                          <Select
                            value={nextStatus}
                            onChange={(value) => setNextStatus(value)}
                            style={{ width: 200 }}
                            placeholder="Chọn trạng thái tiếp theo"
                            disabled={[
                              "COMPLETED",
                              "CANCELLED",
                              "FAILED",
                            ].includes(order.status)}
                          >
                            {nextStatusOptions.map((status) => (
                              <Select.Option key={status} value={status}>
                                <Space>
                                  {getStatusIcon(status)}
                                  <span>{status}</span>
                                </Space>
                              </Select.Option>
                            ))}
                          </Select>
                          <Popconfirm
                            title={`Bạn có chắc muốn cập nhật trạng thái thành ${nextStatus}?`}
                            onConfirm={handleUpdateStatus}
                            okText="Đồng ý"
                            cancelText="Hủy"
                            disabled={
                              !nextStatus ||
                              ["COMPLETED", "CANCELLED", "FAILED"].includes(
                                order.status
                              )
                            }
                          >
                            <MyButton
                              type="primary"
                              disabled={
                                !nextStatus ||
                                ["COMPLETED", "CANCELLED", "FAILED"].includes(
                                  order.status
                               )
                              }
                            >
                              Cập nhật trạng thái
                            </MyButton>
                          </Popconfirm>
                        </Space>
                      </Space>
                    ),
                  },
                ]}
              />
            </Space>
          </Card>
        )}
      </Card>
      {/* Review modal - only for user view */}
      {!isAdminView && (
        <Modal
          title={
            <Space align="center">
              <StarFilled style={{ color: "#fadb14", fontSize: "20px" }} />
              <Title level={4} style={{ margin: 0 }}>
                Đánh giá sản phẩm
              </Title>
            </Space>
          }
          open={reviewModalVisible}
          onCancel={() => setReviewModalVisible(false)}
          footer={null}
          width={600}
          style={{ top: 20 }}
          destroyOnClose
        >
          <Divider style={{ margin: "0 0 12px 0" }} />

          {/* Product info */}
          <Card
            size="small"
            variant="borderless"
            style={{ marginBottom: 20, background: "#f9f9f9", borderRadius: 8 }}
          >
            <Space align="start">
              <Avatar
                shape="square"
                size={64}
                src={selectedProduct?.images && selectedProduct.images.length > 0 ? `${IMAGE_URL}/${selectedProduct.images[0]}` : DEFAULT_IMAGE}
                alt={selectedProduct?.productName}
              />
              <Space orientation="vertical" size={0}>
                <Text strong>{selectedProduct?.productName}</Text>
                <Text type="secondary">Mã: {selectedProduct?.productCode}</Text>
                <Text>
                  Giá:{" "}
                  <Text strong style={{ color: "#f5222d" }}>
                    {selectedProduct?.priceAtPurchase?.toLocaleString()}₫
                  </Text>
                </Text>
              </Space>
            </Space>
          </Card>

          <Form
            form={form}
            onFinish={handleSubmitReview}
            layout="vertical"
            requiredMark={false}
          >
            {/* Rating stars */}
            <Form.Item
              name="rating"
              rules={[{ required: true, message: "Vui lòng chọn số sao!" }]}
            >
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ marginBottom: 10 }}>
                  <Rate
                    onChange={(value) => form.setFieldsValue({ rating: value })}
                    onHoverChange={setHoverRating}
                    style={{ fontSize: 36 }}
                  />
                </div>

                {/* Description based on rating */}
                <Text strong style={{ fontSize: 16 }}>
                  {hoverRating
                    ? ratingDescriptions[Math.ceil(hoverRating) - 1]
                    : form.getFieldValue("rating")
                    ? ratingDescriptions[
                        Math.ceil(form.getFieldValue("rating")) - 1
                      ]
                    : "Hãy đánh giá sản phẩm"}
                </Text>
              </div>
            </Form.Item>

            {/* Review comment */}
            <Form.Item name="comment" label="Nhận xét của bạn">
              <TextArea
                rows={4}
                placeholder="Chia sẻ trải nghiệm của bạn với sản phẩm này..."
                maxLength={500}
                showCount
                style={{ borderRadius: 6 }}
              />
            </Form.Item>

            {/* Submit buttons */}
            <Form.Item>
              <div style={{ textAlign: "center", marginTop: 16 }}>
                <Space>
                  <MyButton
                    type="primary"
                    htmlType="submit"
                    loading={ratingSubmitting}
                    size="large"
                    icon={<StarOutlined />}
                    style={{ borderRadius: 6 }}
                  >
                    Gửi đánh giá
                  </MyButton>
                  <MyButton
                    size="large"
                    onClick={() => setReviewModalVisible(false)}
                    style={{ borderRadius: 6 }}
                  >
                    Hủy
                  </MyButton>
                </Space>
              </div>
            </Form.Item>
          </Form>
        </Modal>
      )}
    </>
  );
}
