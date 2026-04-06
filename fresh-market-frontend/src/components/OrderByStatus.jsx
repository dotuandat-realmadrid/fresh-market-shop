import {
  PhoneOutlined,
  PlusOutlined,
  RightOutlined,
  SearchOutlined,
  ShoppingOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Button,
  Card,
  Col,
  Divider,
  Pagination,
  Popconfirm,
  Row,
  Space,
  Table,
  Typography,
} from "antd";
import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { DEFAULT_IMAGE, IMAGE_URL } from "../api/auth";
import { countTotalPendingOrders } from "../api/order";
import MyButton from "./MyButton";
import CustomPagination from "./CustomPagination/CustomPagination";
import "./OrderByStatus.css";

const { Text } = Typography;

const OrderByStatus = ({
  data,
  loading,
  selectedStatus,
  onStatusChange,
  currentPage,
  pageSize,
  onPageChange,
  onCancelOrder,
}) => {
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");
  const isAdminView = location.pathname === "/admin/orders";
  const [totalPendingItems, setTotalPendingItems] = useState(0);

  useEffect(() => {
    const countTotalPendingItem = async () => {
      try {
        const result = await countTotalPendingOrders();
        setTotalPendingItems(result);
      } catch (error) {
        console.error("Error counting pending orders:", error);
      }
    };

    if (isAdminView) {
      countTotalPendingItem();
    }
  }, [isAdminView]);

  const getStatusColor = (status) => {
    switch (status) {
      case "PENDING":
        return "#1890ff";
      case "CANCELLED":
        return "#ff4d4f";
      case "CONFIRMED":
        return "#722ed1";
      case "SHIPPING":
        return "#fa8c16";
      case "COMPLETED":
        return "#52c41a";
      case "FAILED":
        return "#f5222d";
      default:
        return "#FFF";
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case "PENDING":
        return "Đang chờ xử lý";
      case "CANCELLED":
        return "Đã hủy";
      case "CONFIRMED":
        return "Đã xác nhận";
      case "SHIPPING":
        return "Đang giao hàng";
      case "COMPLETED":
        return "Đã hoàn thành";
      case "FAILED":
        return "Giao hàng thất bại";
      default:
        return status;
    }
  };

  const columns = [
    {
      title: "",
      dataIndex: "id",
      key: "order",
      render: (_, record) => {
        return (
          <Card
            hoverable
            variant="borderless"
            styles={{ body: { padding: "16px" } }}
            style={{ marginBottom: "16px", borderRadius: "8px" }}
          >
            <Row gutter={[24, 16]}>
              {/* Phần thông tin đơn hàng */}
              <Col xs={24} md={7}>
                <Space orientation="vertical" size={3} style={{ width: "100%" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Space>
                      <Badge
                        color={getStatusColor(record.status)}
                        text={
                          <Text strong>{getStatusLabel(record.status)}</Text>
                        }
                      />
                    </Space>
                    <Text type="secondary" copyable={{ text: record.id }}>
                      #{record.id}
                    </Text>
                  </div>
                  <Divider style={{ margin: "8px 0" }} />
                  <Space size={8}>
                    <UserOutlined />
                    <Text>{record.fullName}</Text>
                  </Space>
                  <Space size={8}>
                    <PhoneOutlined />
                    <Text>{record.phone}</Text>
                  </Space>
                </Space>
              </Col>

              {/* Phần chi tiết sản phẩm */}
              <Col xs={24} md={13}>
                <div
                  className="product-list-scroll"
                  style={{
                    maxHeight: "200px",
                    overflowY: "auto",
                    paddingRight: "10px",
                  }}
                >
                  {record.details?.map((detail, index) => (
                    <React.Fragment key={index}>
                      {index > 0 && <Divider style={{ margin: "8px 0" }} />}
                      <Space align="start" style={{ width: "100%" }}>
                        <img
                          src={
                            detail.images && detail.images.length !== 0
                              ? `${IMAGE_URL}/${detail.images[0]}`
                              : DEFAULT_IMAGE
                          }
                          alt={detail.productName}
                          style={{
                            width: 80,
                            height: 80,
                            objectFit: "contain",
                            borderRadius: 4,
                          }}
                        />
                        <Space
                          orientation="vertical"
                          size={0}
                          style={{ width: "100%" }}
                        >
                          <Text strong style={{ fontSize: "14px" }}>
                            {detail.productName}
                          </Text>
                          <Text type="secondary" style={{ fontSize: "12px" }}>
                            Mã: {detail.productCode}
                          </Text>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              marginTop: "4px",
                              minWidth: 200,
                            }}
                          >
                            <Text>
                              {detail.priceAtPurchase?.toLocaleString()}đ
                            </Text>
                            <Text>x{detail.quantity}</Text>
                          </div>
                        </Space>
                      </Space>
                    </React.Fragment>
                  ))}
                </div>
              </Col>

              {/* Phần hành động */}
              <Col
                xs={24}
                md={4}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                {/* Kiểm tra nếu là COMPLETED và isAllReviewed là false và không phải trang admin */}
                {record.status === "COMPLETED" &&
                !record.isAllReviewed &&
                !isAdminPath ? (
                  <Link to={`/orders/${record.id}`}>
                    <Button
                      type="primary"
                      shape="round"
                      style={{
                        backgroundColor: "#ff4d4f",
                        borderColor: "#ff4d4f",
                        fontWeight: "bold",
                        boxShadow: "0 2px 8px rgba(255, 77, 79, 0.5)",
                        animation: "pulse 1.5s infinite",
                      }}
                      icon={<StarOutlined />}
                    >
                      Đánh giá
                    </Button>
                  </Link>
                ) : (
                  <Link
                    to={
                      isAdminPath
                        ? `/admin/orders/${record.id}`
                        : `/orders/${record.id}`
                    }
                  >
                    <Button
                      type="primary"
                      shape="round"
                      icon={<RightOutlined />}
                    >
                      Chi tiết
                    </Button>
                  </Link>
                )}

                {record.status === "PENDING" && (
                  <Popconfirm
                    title="Bạn có chắc muốn hủy đơn hàng này?"
                    onConfirm={() => onCancelOrder(record.id)}
                    okText="Đồng ý"
                    cancelText="Hủy"
                  >
                    <Button shape="round" danger style={{ marginTop: "8px" }}>
                      Hủy đơn hàng
                    </Button>
                  </Popconfirm>
                )}
              </Col>
            </Row>
          </Card>
        );
      },
    },
  ];

  const ORDER_STATUSES = [
    { code: "PENDING", label: "Đang chờ xử lý" },
    { code: "CANCELLED", label: "Đã hủy" },
    { code: "CONFIRMED", label: "Đã xác nhận" },
    { code: "SHIPPING", label: "Đang giao hàng" },
    { code: "COMPLETED", label: "Đã hoàn thành" },
    { code: "FAILED", label: "Giao hàng thất bại" },
  ];

  return (
    <>
      <Card style={{ marginBottom: 16, borderRadius: "8px" }}>
        <Space
          size="large"
          wrap
          style={{ justifyContent: "center", width: "100%" }}
        >
          {ORDER_STATUSES.map((status) => (
            <Badge
              count={
                status.code === "PENDING" && isAdminView ? totalPendingItems : 0
              }
              key={status.code}
              offset={[-5, 0]}
            >
              <Button
                type={selectedStatus === status.code ? "primary" : "text"}
                onClick={() => onStatusChange(status.code)}
                style={{
                  borderRadius: "20px",
                  padding: "4px 16px",
                  backgroundColor:
                    selectedStatus === status.code
                      ? getStatusColor(status.code)
                      : "transparent",
                  borderColor:
                    selectedStatus === status.code
                      ? getStatusColor(status.code)
                      : "transparent",
                }}
              >
                {status.label}
              </Button>
            </Badge>
          ))}
        </Space>
      </Card>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Text strong>Tổng số: {data?.totalElements || 0} đơn hàng</Text>
        {isAdminView && (
          <div>
            <Link to={"/admin/orders/search"}>
              <MyButton icon={<SearchOutlined />}>Tìm kiếm</MyButton>
            </Link>
            <Link to={"/admin/orders/create"}>
              <Button
                type="primary"
                icon={<PlusOutlined />}
                style={{ marginLeft: 16 }}
              >
                Thêm mới
              </Button>
            </Link>
          </div>
        )}
      </div>

      {data ? (
        <>
          <Table
            columns={columns}
            dataSource={data.data || data.content || []}
            rowKey="id"
            pagination={false}
            loading={loading}
            showHeader={false}
          />
          <div
            style={{
              marginTop: "16px",
              display: "flex",
              justifyContent: "flex-end",
            }}
          >
            <CustomPagination
              current={currentPage}
              pageSize={pageSize}
              total={data.totalElements}
              onChange={onPageChange}
              layout="right"
            />
          </div>
        </>
      ) : (
        <Card style={{ textAlign: "center", padding: "40px 0" }}>
          <ShoppingOutlined style={{ fontSize: "48px", color: "#d9d9d9" }} />
          <p style={{ marginTop: "16px" }}>Đang tải dữ liệu...</p>
        </Card>
      )}
      
      <style jsx="true">{`
        @keyframes pulse {
          0% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
          100% {
            transform: scale(1);
          }
        }
      `}</style>
    </>
  );
};

export default OrderByStatus;
