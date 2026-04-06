import {
  BackwardOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  DollarOutlined,
  FileTextOutlined,
  MailOutlined,
  PhoneOutlined,
  PlusOutlined,
  TagOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Radio,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Typography,
} from "antd";
import TextArea from "antd/es/input/TextArea";
import { debounce } from "lodash";
import { useCallback, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createInStoreOrder } from "../../api/order";
import { getProductByCode, searchProducts } from "../../api/product";
import { createGuest } from "../../api/user";
import "./AccountAdmin.css";

const { Text } = Typography;
const { Option } = Select;

export default function OrderCreationAdmin() {
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState([]);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("CASH");
  const navigate = useNavigate();

  const [form] = Form.useForm();

  const fetchProducts = async (search = "") => {
    setLoading(true);
    try {
      const request = {
        id: "",
        categoryCode: "",
        supplierCode: "",
        code: "",
        name: search,
        minPrice: "",
        maxPrice: "",
      };

      const data = await searchProducts(request, 1, 10);
      setProducts(data.data);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
    setLoading(false);
  };

  const handleSelect = (value, option) => {
    // Tránh trùng lặp: Nếu đã có, không thêm lại
    const product = JSON.parse(value);

    if (!selectedProducts.some((p) => p.productCode === product.code)) {
      setSelectedProducts((prev) => [
        {
          productId: product.id,
          productCode: product.code,
          code: option.children,
          quantity: 1,
          price: product.price,
          discountPrice: product.discountPrice,
          isExisting: false,
        },
        ...prev,
      ]);
    }
  };

  const debouncedSearch = useMemo(
    () => debounce((value) => fetchProducts(value), 300),
    []
  );

  const handleRemove = (productCode) => {
    // Chỉ xóa những item có productCode khớp
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productCode !== productCode)
    );
  };

  const handleQuantityChange = (value, productCode) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productCode === productCode ? { ...p, quantity: value } : p
      )
    );
  };

  const handleSearch = useCallback(
    (value) => {
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  // Hàm kiểm tra số lượng so với tồn kho dựa trên productCode
  const checkInventory = async () => {
    for (const item of selectedProducts) {
      const product = await getProductByCode(item.productCode);
      if (product && item.quantity > product.inventoryQuantity) {
        message.error(
          `Số lượng sản phẩm "${item.productCode}" vượt quá tồn kho (${product.inventoryQuantity} cái). Vui lòng kiểm tra lại!`
        );
        return false;
      }
    }
    return true;
  };

  const calculateTotal = () => {
    return (
      selectedProducts?.reduce(
        (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
        0
      ) || 0
    );
  };

  const handleCheckout = async (values) => {
    if (isSubmitting) return;

    // Kiểm tra số lượng tồn kho trước khi xử lý
    const hasEnoughInventory = await checkInventory();
    if (!hasEnoughInventory) {
      return;
    }

    setIsSubmitting(true);

    let guest;

    try {
      const guestData = {
        username: values.username,
        fullName: values.fullName,
        phone: values.phone,
      };
      guest = await createGuest(guestData);

      const orderRequest = {
        userId: guest.id,
        orderType: "OFFLINE",
        totalPrice: calculateTotal(),
        status: "COMPLETED",
        paymentMethod: paymentMethod,
        note: values.note,
        details: selectedProducts?.map((item) => ({
          productId: item.productId,
          quantity: item.quantity,
          priceAtPurchase: item.discountPrice || item.price,
        })),
      };
      // Gọi API tạo đơn hàng và nhận response
      const orderResponse = await createInStoreOrder(orderRequest);

      // Điều hướng đến trang chi tiết hoặc thành công
      message.success("Đặt hàng thành công!");
      navigate(`/admin/orders/${orderResponse.id}`);
    } catch (error) {
      console.error("Lỗi khi gửi dữ liệu:", error);
      message.error("Có lỗi xảy ra khi xử lý đơn hàng. Vui lòng thử lại sau!");
    } finally {
      setIsSubmitting(false);
    }
  };

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "code",
      render: (code) => (
        <Link to={`/admin/products/${code}`} target="_blank">
          <TagOutlined style={{ marginRight: 8 }} />
          {code}
        </Link>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (text, record) => (
        <InputNumber
          min={1}
          value={record.quantity}
          onChange={(value) => handleQuantityChange(value, record.productCode)}
          style={{ width: 100 }}
          addonAfter="cái"
        />
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      render: (text, record) => (
        <Space orientation="vertical" size={0}>
          {record.discountPrice && record.discountPrice < record.price ? (
            <>
              <Text delete type="secondary">
                {record.price.toLocaleString("vi-VN")}đ
              </Text>
              <Text type="danger" strong>
                {record.discountPrice.toLocaleString("vi-VN")}đ
              </Text>
            </>
          ) : (
            <Text strong>{record.price.toLocaleString("vi-VN")}đ</Text>
          )}
        </Space>
      ),
    },
    {
      title: "Thành tiền",
      render: (_, item) => (
        <Text strong style={{ color: "#f50" }}>
          {((item.discountPrice || item.price) * item.quantity).toLocaleString(
            "vi-VN"
          )}
          đ
        </Text>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.productCode)}
        >
          Xóa
        </Button>
      ),
    },
  ];

  const totalAmount = selectedProducts.reduce(
    (sum, item) => sum + (item.discountPrice || item.price) * item.quantity,
    0
  );

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Thêm mới đơn hàng</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link>
          <span style={{ margin: '0 8px' }}> / </span>
          <Link to="/admin/orders">Quản lý đơn hàng</Link>
          <span style={{ margin: '0 8px' }}> / </span>
          <span className="active">Thêm mới đơn hàng</span>
        </div>
      </div>

      <Card
        size="small"
        title={<Text strong>Đơn hàng</Text>}
        extra={
          <Select
            showSearch
            placeholder="Tìm và chọn sản phẩm"
            style={{ width: 300 }}
            filterOption={false}
            onSearch={handleSearch}
            onSelect={handleSelect}
            notFoundContent={
              loading ? <Spin size="small" /> : "Không có sản phẩm"
            }
            suffixIcon={<PlusOutlined />}
          >
            {products.map((product) => (
              <Option key={product.code} value={JSON.stringify(product)}>
                {product.code}
              </Option>
            ))}
          </Select>
        }
        style={{ marginBottom: 24 }}
      >
        <Table
          columns={columns}
          dataSource={selectedProducts}
          rowKey="productCode"
          pagination={false}
          bordered
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  <span>
                    Chưa có sản phẩm nào. Vui lòng tìm và chọn sản phẩm từ danh
                    sách.
                  </span>
                }
              />
            ),
          }}
          summary={() => (
            <Table.Summary fixed>
              <Table.Summary.Row>
                <Table.Summary.Cell index={0} colSpan={3} align="right">
                  <Text strong>Tổng tiền:</Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={1}>
                  <Text strong style={{ color: "#ff4d4f", fontSize: 16 }}>
                    {totalAmount.toLocaleString("vi-VN")}đ
                  </Text>
                </Table.Summary.Cell>
                <Table.Summary.Cell index={2}></Table.Summary.Cell>
              </Table.Summary.Row>
            </Table.Summary>
          )}
        />
      </Card>

      <Card
        title={
          <Space>
            <span>Thông tin khách hàng</span>
          </Space>
        }
        type="inner"
        style={{ marginBottom: 24 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCheckout}
          requiredMark="optional"
        >
          <Row gutter={[24, 16]}>
            <Col xs={24} md={8}>
              <Form.Item
                name="username"
                label="Email"
                rules={[
                  { required: true, message: "Vui lòng nhập email" },
                  { type: "email", message: "Email không hợp lệ" },
                ]}
              >
                <Input
                  prefix={<MailOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="Email của bạn"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="fullName"
                label="Họ và tên"
                rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
              >
                <Input
                  prefix={<UserOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
                  placeholder="Họ và tên người nhận"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={8}>
              <Form.Item
                name="phone"
                label="Số điện thoại"
                rules={[
                  { required: true, message: "Vui lòng nhập số điện thoại" },
                  {
                    pattern: /^0\d{9}$/,
                    message: "Số điện thoại không hợp lệ",
                  },
                ]}
              >
                <Input
                  prefix={
                    <PhoneOutlined style={{ color: "rgba(0,0,0,.25)" }} />
                  }
                  placeholder="Số điện thoại liên hệ"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="note" label="Ghi chú">
            <TextArea
              maxLength={255}
              prefix={<FileTextOutlined style={{ color: "rgba(0,0,0,.25)" }} />}
              placeholder="Ghi chú thêm về đơn hàng hoặc giao hàng (nếu có)"
              rows={3}
            />
          </Form.Item>

          <Divider titlePlacement="left">
            <Space>
              <CreditCardOutlined />
              <span>Phương thức thanh toán</span>
            </Space>
          </Divider>

          <div style={{ marginBottom: 24 }}>
            <Radio.Group
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{ width: "100%" }}
            >
              <Space orientation="vertical" style={{ width: "100%" }}>
                <Card
                  hoverable
                  size="small"
                  style={{
                    border:
                      paymentMethod === "CASH"
                        ? "2px solid #1890ff"
                        : undefined,
                    borderRadius: 8,
                    marginBottom: 8,
                  }}
                  styles={{ body: { padding: "12px 16px" } }}
                  onClick={() => setPaymentMethod("CASH")}
                >
                  <Radio value="CASH">
                    <Space>
                      <DollarOutlined style={{ fontSize: 18 }} />
                      <span style={{ fontWeight: 500 }}>
                        Thanh toán bằng tiền mặt
                      </span>
                    </Space>
                  </Radio>
                </Card>
                <Card
                  hoverable
                  size="small"
                  style={{
                    border:
                      paymentMethod === "E_WALLET"
                        ? "2px solid #1890ff"
                        : undefined,
                    borderRadius: 8,
                  }}
                  styles={{ body: { padding: "12px 16px" } }}
                  onClick={() => setPaymentMethod("E_WALLET")}
                >
                  <Radio value="E_WALLET">
                    <Space>
                      <CreditCardOutlined style={{ fontSize: 18 }} />
                      <span style={{ fontWeight: 500 }}>
                        Chuyển khoản ngân hàng
                      </span>
                    </Space>
                  </Radio>
                </Card>
              </Space>
            </Radio.Group>
          </div>

          <Divider />

          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Link to={"/admin/orders"}>
              <Button icon={<BackwardOutlined />}>
                <Space>
                  <span>Hủy thao tác</span>
                </Space>
              </Button>
            </Link>

            <Space align="end" orientation="vertical">
              <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <Space orientation="vertical" align="end">
                  <Text>Tổng thanh toán:</Text>
                  <Text
                    style={{
                      fontSize: 24,
                      fontWeight: "bold",
                      color: "#f50",
                    }}
                  >
                    {totalAmount.toLocaleString("vi-VN") + "đ"}
                  </Text>
                </Space>
                <Button
                  type="primary"
                  htmlType="submit"
                  size="large"
                  loading={isSubmitting}
                  style={{ height: 50, fontSize: 16, width: 200 }}
                >
                  Đặt hàng
                </Button>
              </div>
            </Space>
          </div>
        </Form>
      </Card>
    </>
  );
}
