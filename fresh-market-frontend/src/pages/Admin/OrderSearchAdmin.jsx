import {
  ClearOutlined,
  PhoneOutlined,
  RightOutlined,
  SearchOutlined,
  ShoppingOutlined,
  StarOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Avatar,
  Badge,
  Breadcrumb,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Popconfirm,
  Row,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import OrderByStatus from "../../components/OrderByStatus";
import "../../components/OrderByStatus.css";
import CustomPagination from "../../components/CustomPagination/CustomPagination";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchOrder, cancelOrder } from "../../api/order";
import dayjs from "dayjs";
import { DEFAULT_IMAGE, IMAGE_URL } from "../../api/auth";
import "./AccountAdmin.css";

const { Text } = Typography;

export default function OrderSearchAdmin() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();
  const isAdminPath = location.pathname.startsWith("/admin");

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
  });
  
  // Update URL with search params and pagination
  const updateUrl = useCallback(
    (searchValues, page, size) => {
      const params = new URLSearchParams();

      // Add search parameters
      Object.entries(searchValues).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "") {
          params.append(key, value);
        }
      });

      // Add pagination parameters
      params.append("page", page);
      params.append("size", size);

      // Update URL without triggering navigation (to avoid loop)
      navigate(
        {
          pathname: location.pathname,
          search: params.toString(),
        },
        { replace: true }
      );
    },
    [location.pathname, navigate]
  );

  // Fetch data from API with form values
  const fetchData = useCallback(
    async (formValues, page = 1, size = 5) => {
      setLoading(true);

      try {
        // Format search values for API
        const formattedValues = formatValues(formValues);

        // Update URL
        updateUrl(formattedValues, page, size);

        // Call API
        const result = await searchOrder(formattedValues, page, size);

        if (result) {
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching order data:", error);
      } finally {
        setLoading(false);
      }
    },
    [updateUrl]
  );

  // Parse URL params and fill form on component mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);

    // Get all search params
    const id = params.get("id");
    const email = params.get("email");
    const fullName = params.get("fullName");
    const phone = params.get("phone");
    const startDate = params.get("startDate");
    const endDate = params.get("endDate");
    const page = parseInt(params.get("page")) || 1;
    const size = parseInt(params.get("size")) || 5;

    // Set pagination
    setPagination({
      current: page,
      pageSize: size,
    });

    // Prepare form values
    const formValues = {
      id,
      email,
      fullName,
      phone,
      startDate: startDate ? dayjs(startDate) : undefined,
      endDate: endDate ? dayjs(endDate) : undefined,
    };

    // Filter out undefined/null values
    const filteredValues = Object.fromEntries(
      Object.entries(formValues).filter(
        ([_, value]) => value !== undefined && value !== null
      )
    );

    // Set form values
    form.setFieldsValue(filteredValues);

    // If there are any search parameters, perform search
    if (Object.keys(filteredValues).length > 0 || page > 1) {
      fetchData(filteredValues, page, size);
    }
  }, [fetchData, form, location.search]);

  // Convert form values to API format
  const formatValues = (values) => {
    if (!values) return {};

    return {
      ...values,
      startDate: values.startDate
        ? values.startDate.format("YYYY-MM-DD")
        : undefined,
      endDate: values.endDate ? values.endDate.format("YYYY-MM-DD") : undefined,
    };
  };

  // Handle form submission
  const handleSearch = (values) => {
    setPagination({
      current: 1,
      pageSize: pagination.pageSize,
    });
    fetchData(values, 1, pagination.pageSize);
  };

  // Handle form reset
  const handleReset = () => {
    form.resetFields();
    setData(null);
    setPagination({
      current: 1,
      pageSize: 5,
    });
    updateUrl({}, 1, 5);
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    const finalPageSize = pageSize || pagination.pageSize;
    setPagination({
      current: page,
      pageSize: finalPageSize,
    });
    const formValues = form.getFieldsValue();
    fetchData(formValues, page, finalPageSize);
  };

  // Handle cancel order
  const handleCancelOrder = async (orderId) => {
    try {
      await cancelOrder(orderId);
      const formValues = form.getFieldsValue();
      fetchData(formValues, pagination.current, pagination.pageSize);
    } catch (error) {
      console.error(`Error cancelling order ${orderId}:`, error);
    }
  };

  // Status configuration functions (from OrderByStatus)
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
        return "#d9d9d9";
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

  // Table columns (adapting from OrderByStatus component)
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
              {/* Order information section */}
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

              {/* Product details section */}
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

              {/* Action section */}
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
                <Link to={`/admin/orders/${record.id}`}>
                  <Button
                    type="primary"
                    shape="round"
                    icon={<RightOutlined />}
                  >
                    Chi tiết
                  </Button>
                </Link>

                {record.status === "PENDING" && (
                  <Popconfirm
                    title="Bạn có chắc muốn hủy đơn hàng này?"
                    onConfirm={() => handleCancelOrder(record.id)}
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

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Quản lý đơn hàng</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link>
          <span style={{ margin: '0 8px' }}> / </span>
          <Link to="/admin/orders">Quản lý đơn hàng</Link>
          <span style={{ margin: '0 8px' }}> / </span>
          <span className="active">Tìm kiếm</span>
        </div>
      </div>

      {/* Search Form Section */}
      <Card
        title="Tìm kiếm đơn hàng"
        style={{ width: "100%", marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          autoComplete="off"
        >
          <Row gutter={[16]}>
            <Col xl={6} lg={6}>
              <Form.Item
                name="id"
                label="Mã đơn hàng"
                style={{ flex: "1 1 200px" }}
              >
                <Input placeholder="Nhập mã đơn hàng" />
              </Form.Item>
            </Col>

            <Col xl={6} lg={6}>
              <Form.Item
                name="email"
                label="Email"
                style={{ flex: "1 1 200px" }}
              >
                <Input placeholder="Nhập email khi đặt hàng" />
              </Form.Item>
            </Col>

            <Col xl={6} lg={6}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                style={{ flex: "1 1 200px" }}
              >
                <Input placeholder="Nhập họ và tên" />
              </Form.Item>
            </Col>

            <Col xl={6} lg={6}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                style={{ flex: "1 1 200px" }}
              >
                <Input placeholder="Nhập số điện thoại khi đặt hàng" />
              </Form.Item>
            </Col>

            <Col xl={6} lg={6}>
              <Form.Item
                name="startDate"
                label="Từ ngày"
                style={{ flex: "1 1 200px" }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Từ ngày"
                />
              </Form.Item>
            </Col>

            <Col xl={6} lg={6}>
              <Form.Item
                name="endDate"
                label="Đến ngày"
                style={{ flex: "1 1 200px" }}
              >
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Đến ngày"
                />
              </Form.Item>
            </Col>

            <Col xl={12} lg={12} style={{ textAlign: "right", marginTop: 29 }}>
              <Space>
                <Button onClick={handleReset} icon={<ClearOutlined />}>
                  Xóa bộ lọc
                </Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  Tìm kiếm
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* Results Section - Only show if data exists */}
      {data && (
        <>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Tổng số: {data?.totalElements || 0} đơn hàng</Text>
          </div>

          <Spin spinning={loading}>
            {data.data && data.data.length > 0 ? (
              <>
                <Table
                  columns={columns}
                  dataSource={data.data}
                  rowKey="id"
                  pagination={false}
                  showHeader={false}
                />
                {/* Pagination */}
                <div
                  style={{
                    marginTop: "16px",
                    display: "flex",
                    justifyContent: "flex-end",
                  }}
                >
                  <CustomPagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={data.totalElements || 0}
                    onChange={handlePaginationChange}
                    layout="right"
                  />
                </div>
              </>
            ) : (
              <Card style={{ textAlign: "center", padding: "40px 0" }}>
                <ShoppingOutlined
                  style={{ fontSize: "48px", color: "#d9d9d9" }}
                />
                <p style={{ marginTop: "16px" }}>Không có dữ liệu</p>
              </Card>
            )}
          </Spin>
        </>
      )}
    </>
  );
}
