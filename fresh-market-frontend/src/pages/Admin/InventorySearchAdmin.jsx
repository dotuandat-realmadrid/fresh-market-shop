import {
  CalendarOutlined,
  ClearOutlined,
  RightOutlined,
  SearchOutlined,
  ShoppingOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Badge,
  Breadcrumb,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Pagination,
  Row,
  Space,
  Spin,
  Typography,
} from "antd";
import MyButton from "../../components/MyButton";
import dayjs from "dayjs";
import "./AccountAdmin.css";
import React, { useState, useEffect, useCallback } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { searchInventory } from "../../api/inventoryReceipt";

const { Text } = Typography;

// Status configurations
const STATUS_CONFIG = {
  PENDING: { color: "#fa8c16", label: "Chờ xử lý" },
  COMPLETED: { color: "#52c41a", label: "Hoàn thành" },
  CANCELED: { color: "#ff4d4f", label: "Đã hủy" },
};

// Format helpers
const formatDate = (date) =>
  date ? dayjs(date).format("DD/MM/YYYY HH:mm") : "-";
const formatCurrency = (amount) =>
  amount ? amount.toLocaleString("vi-VN") + "đ" : "-";

export default function InventorySearchAdmin() {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const location = useLocation();

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });

  // Convert form values to API format
  const formatValues = (values) => {
    if (!values) return {};

    const formatted = { ...values };
    if (values.startDate) formatted.startDate = values.startDate.format("YYYY-MM-DD");
    if (values.endDate) formatted.endDate = values.endDate.format("YYYY-MM-DD");
    return formatted;
  };

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
    async (formValues, page = 1, size = 10) => {
      setLoading(true);
      try {
        const formattedValues = formatValues(formValues);
        updateUrl(formattedValues, page, size);
        const result = await searchInventory(formattedValues, page, size);
        if (result) {
          setData(result);
        }
      } catch (error) {
        console.error("Error fetching inventory data:", error);
      } finally {
        setLoading(false);
      }
    },
    [updateUrl]
  );

  // Parse URL search params to get query values
  const parseUrlParams = useCallback(() => {
    const params = new URLSearchParams(location.search);
    const values = {};

    if (params.get("id")) values.id = params.get("id");
    if (params.get("email")) values.email = params.get("email");
    if (params.get("startDate")) values.startDate = dayjs(params.get("startDate"));
    if (params.get("endDate")) values.endDate = dayjs(params.get("endDate"));

    const page = parseInt(params.get("page")) || 1;
    const size = parseInt(params.get("size")) || 10;

    return { values, page, size };
  }, [location.search]);

  // Load initial data from URL params when component mounts
  useEffect(() => {
    const { values, page, size } = parseUrlParams();
    form.setFieldsValue(values);
    setPagination({ current: page, pageSize: size });
    if (Object.keys(values).length > 0 || page > 1) {
      fetchData(values, page, size);
    }
  }, []); // Only on mount

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
      pageSize: 10,
    });
    updateUrl({}, 1, 10);
  };

  // Handle pagination change
  const handlePaginationChange = (page, pageSize) => {
    setPagination({
      current: page,
      pageSize,
    });
    const formValues = form.getFieldsValue();
    fetchData(formValues, page, pageSize);
  };

  // Render helpers
  const getStatusColor = (status) => STATUS_CONFIG[status]?.color || "#d9d9d9";
  const getStatusLabel = (status) => STATUS_CONFIG[status]?.label || status;

  return (
    <div className="account-admin-container inventory-admin-container">
      <div className="pagetitle mb-4">
        <h1>Tìm kiếm phiếu nhập</h1>
        <nav>
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/admin/inventory-receipts">Quản lý nhập kho</Link></li>
            <li className="breadcrumb-item active">Tìm kiếm phiếu nhập</li>
          </ol>
        </nav>
      </div>

      {/* Search Form Section */}
      <Card
        title="Tìm kiếm phiếu nhập kho"
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
              <Form.Item name="id" label="Mã phiếu nhập">
                <Input placeholder="Nhập mã phiếu nhập" />
              </Form.Item>
            </Col>

            <Col xl={6} lg={6}>
              <Form.Item name="email" label="Email">
                <Input placeholder="Nhập email người nhập" />
              </Form.Item>
            </Col>

            <Col xl={6} lg={6}>
              <Form.Item name="startDate" label="Từ ngày">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Từ ngày"
                />
              </Form.Item>
            </Col>

            <Col xl={6} lg={6}>
              <Form.Item name="endDate" label="Đến ngày">
                <DatePicker
                  style={{ width: "100%" }}
                  format="DD/MM/YYYY"
                  placeholder="Đến ngày"
                />
              </Form.Item>
            </Col>
          </Row>

          <Space>
            <MyButton
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={loading}
            >
              Tìm kiếm
            </MyButton>
            <MyButton onClick={handleReset} icon={<ClearOutlined />}>
              Xóa bộ lọc
            </MyButton>
          </Space>
        </Form>
      </Card>

      {/* Results Section - Only show if data exists */}
      {data && (
        <Spin spinning={loading}>
          <div
            style={{
              marginBottom: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text strong>Tổng số: {data?.totalElements || 0} phiếu nhập</Text>
          </div>

          <div>
            {(data.data && data.data.length > 0) ? (
              <>
                {data.data.map((receipt) => (
                  <Card
                    key={receipt.id}
                    hoverable
                    variant="borderless"
                    styles={{ body: { padding: "16px" } }}
                    style={{ marginBottom: "16px", borderRadius: "8px" }}
                  >
                    <Row gutter={[24, 16]}>
                      {/* Receipt Info */}
                      <Col xs={24} md={6}>
                        <Space
                          orientation="vertical"
                          size={3}
                          style={{ width: "100%" }}
                        >
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Badge
                              color={getStatusColor(receipt.status)}
                              text={
                                <Text strong>
                                  {getStatusLabel(receipt.status)}
                                </Text>
                              }
                            />
                            <Text
                              type="secondary"
                              copyable={{ text: receipt.id }}
                            >
                              #{receipt.id}
                            </Text>
                          </div>
                          <Divider style={{ margin: "8px 0" }} />

                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                            }}
                          >
                            <Text>Tổng tiền:</Text>
                            <Text strong style={{ color: "#ff4d4f" }}>
                              {formatCurrency(receipt.totalAmount)}
                            </Text>
                          </div>
                        </Space>
                      </Col>

                      {/* Time Info */}
                      <Col xs={24} md={6}>
                        <Space
                          orientation="vertical"
                          size={3}
                          style={{ width: "100%" }}
                        >
                          <Text strong>Thông tin thời gian</Text>
                          <Divider style={{ margin: "8px 0" }} />
                          <Space size={8}>
                            <CalendarOutlined />
                            <Text>Tạo: {formatDate(receipt.createdDate)}</Text>
                          </Space>
                          {receipt.modifiedDate && (
                            <Space size={8}>
                              <CalendarOutlined />
                              <Text>
                                Sửa: {formatDate(receipt.modifiedDate)}
                              </Text>
                            </Space>
                          )}
                        </Space>
                      </Col>

                      {/* Person Info */}
                      <Col xs={24} md={8}>
                        <Space
                          orientation="vertical"
                          size={3}
                          style={{ width: "100%" }}
                        >
                          <Text strong>Người thực hiện</Text>
                          <Divider style={{ margin: "8px 0" }} />
                          <Space size={8}>
                            <UserOutlined />
                            <Text>Tạo: {receipt.createdBy || "-"}</Text>
                          </Space>
                          {receipt.modifiedBy && (
                            <Space size={8}>
                              <UserOutlined />
                              <Text>Sửa: {receipt.modifiedBy}</Text>
                            </Space>
                          )}
                        </Space>
                      </Col>

                      {/* Actions */}
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
                        <Link to={`/admin/inventory-receipts/${receipt.id}`}>
                          <MyButton
                            type="primary"
                            shape="round"
                            icon={<RightOutlined />}
                          >
                            Chi tiết
                          </MyButton>
                        </Link>
                      </Col>
                    </Row>
                  </Card>
                ))}

                {/* Pagination */}
                <div
                  style={{
                    display: "flex",
                    justifyContent: "flex-end",
                    marginTop: 16,
                  }}
                >
                  <Pagination
                    current={pagination.current}
                    pageSize={pagination.pageSize}
                    total={data.totalElements || 0}
                    onChange={handlePaginationChange}
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
          </div>
        </Spin>
      )}
    </div>
  );
}
