import {
  DeleteOutlined,
  FileTextOutlined,
  PlusOutlined,
  SaveOutlined,
  ShoppingCartOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  Alert,
  App,
  Breadcrumb,
  Card,
  Col,
  Divider,
  Empty,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Row,
  Select,
  Space,
  Spin,
  Table,
  Tag,
  Typography,
} from "antd";
import MyButton from "../../components/MyButton";
import { useCallback, useEffect, useMemo, useState } from "react";

// Tự viết hàm debounce để không cần cài thêm thư viện lodash.debounce
const debounce = (func, wait) => {
    let timeout;
    const debounced = (...args) => {
        clearTimeout(timeout);
        timeout = setTimeout(() => func(...args), wait);
    };
    debounced.cancel = () => clearTimeout(timeout);
    return debounced;
};
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  createInventoryReceipt,
  getInventoryReceiptById,
  updateInventoryReceipt,
  updateInventoryReceiptStatus,
} from "../../api/inventoryReceipt";
import "./AccountAdmin.css";
import { searchProducts } from "../../api/product";
import { hasPermission } from "../../services/authService";

const { Option } = Select;
const { Title, Text } = Typography;

// Status configuration for consistent UI
const STATUS_CONFIG = {
  PENDING: { color: "warning", text: "Chờ xử lý" },
  COMPLETED: { color: "success", text: "Hoàn thành" },
  CANCELED: { color: "error", text: "Đã hủy" },
};

export default function InventoryReceiptDetailAdmin() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingDetails, setFetchingDetails] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [note, setNote] = useState("");
  const [open, setOpen] = useState(false);
  const { id } = useParams();
  const [currentStatus, setCurrentStatus] = useState(null);
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { modal } = App.useApp();

  const fetchReceiptDetails = async (receiptId) => {
    try {
      const data = await getInventoryReceiptById(receiptId);
      setNote(data.note || "");
      setStatus(data.status);
      setCurrentStatus(data.status);

      const updatedProducts = (data.detailResponses || [])
        .filter((item) => item.productCode) // Chỉ lấy sản phẩm có productCode hợp lệ
        .map((item) => ({
          productCode: item.productCode, // Giữ nguyên ID từ API
          code: item.productCode, // Hiển thị mã sản phẩm
          quantity: item.quantity,
          price: item.price,
          isExisting: true,
        }));

      setSelectedProducts(updatedProducts);
    } catch (error) {
      console.error("Lỗi khi lấy chi tiết nhập kho:", error);
    }
  };

  useEffect(() => {
    if (id) {
      setFetchingDetails(true);
      fetchReceiptDetails(id).finally(() => setFetchingDetails(false));
    }
  }, [id]);

  const fetchProductsList = async (search = "") => {
    setLoading(true);
    try {
      const request = {
        name: search,
      };

      const data = await searchProducts(request, 1, 10);
      setProducts(data.data);
    } catch (error) {
      console.error("Lỗi khi lấy sản phẩm:", error);
    }
    setLoading(false);
  };

  const debouncedSearch = useMemo(
    () => debounce((value) => fetchProductsList(value), 300),
    []
  );

  const handleSearch = useCallback(
    (value) => {
      debouncedSearch(value);
    },
    [debouncedSearch]
  );

  useEffect(() => {
    return () => debouncedSearch.cancel();
  }, [debouncedSearch]);

  const handleSelect = (value) => {
    // Tránh trùng lặp: Nếu đã có, không thêm lại
    if (!selectedProducts.some((p) => p.productCode === value)) {
      const product = products.find((p) => p.code === value);
      setSelectedProducts((prev) => [
        {
          productCode: value,
          code: value,
          quantity: 1,
          price: product ? product.price : 0,
          isExisting: false,
        },
        ...prev,
      ]);
    }
  };

  const handleQuantityChange = (value, productCode) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productCode === productCode ? { ...p, quantity: value } : p
      )
    );
  };

  const handlePriceChange = (value, productCode) => {
    setSelectedProducts((prev) =>
      prev.map((p) =>
        p.productCode === productCode ? { ...p, price: value } : p
      )
    );
  };

  const handleRemove = (productCode) => {
    // Chỉ xóa những item có productCode khớp
    setSelectedProducts((prev) =>
      prev.filter((p) => p.productCode !== productCode)
    );
  };

  const totalAmount = selectedProducts.reduce(
    (sum, p) => sum + (p.quantity || 0) * (p.price || 0),
    0
  );

  const handleSubmit = async () => {
    modal.confirm({
      title: id ? "Xác nhận cập nhật" : "Xác nhận tạo phiếu",
      content: id
        ? "Bạn có chắc chắn muốn cập nhật phiếu nhập kho này không?"
        : "Bạn có chắc chắn muốn tạo phiếu nhập kho mới không?",
      okText: id ? "Cập nhật" : "Tạo phiếu",
      cancelText: "Hủy",
      onOk: async () => {
        try {
          setSubmitting(true);
          const payload = {
            totalAmount,
            note,
            details: selectedProducts.map(({ productCode, quantity, price }) => ({
              productCode,
              quantity,
              price,
            })),
          };

          if (id) {
            await updateInventoryReceipt(id, payload);
            modal.success({ content: "Cập nhật phiếu nhập kho thành công!" });
          } else {
            await createInventoryReceipt(payload);
            // modal.success({ content: "Tạo phiếu nhập kho thành công!" });
            message.success("Tạo phiếu nhập kho thành công!");
            navigate("/admin/inventory-receipts");
          }
        } catch (error) {
          console.error("Lỗi khi lưu phiếu nhập kho:", error);
          modal.error({ content: error.message || "Lưu phiếu nhập kho thất bại!" });
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const handleStatusChange = async (newStatus) => {
    setStatus(newStatus);
    setOpen(false);
  };

  const handleSubmitStatusChange = async (newStatus) => {
    if (!id) return;

    modal.confirm({
      title: "Xác nhận thay đổi trạng thái",
      content: `Bạn có chắc chắn muốn thay đổi trạng thái phiếu nhập kho thành "${
        STATUS_CONFIG[newStatus]?.text || newStatus
      }" không?`,
      okText: "Xác nhận",
      cancelText: "Hủy",
      okButtonProps: {
        danger: newStatus === "CANCELED",
      },
      onOk: async () => {
        try {
          setSubmitting(true);
          const data = {
            status: newStatus,
          };
          await updateInventoryReceiptStatus(id, data);
          setCurrentStatus(newStatus);
          message.success("Cập nhật trạng thái thành công");
        } catch (error) {
          console.error("Lỗi khi cập nhật trạng thái:", error);
          message.error(error.message || "Cập nhật trạng thái thất bại");
        } finally {
          setSubmitting(false);
        }
      },
    });
  };

  const columns = [
    {
      title: "Mã sản phẩm",
      dataIndex: "code",
      render: (code) => (
        <Space>
            <TagOutlined />
            {code}
        </Space>
      ),
    },
    {
      title: "Số lượng",
      dataIndex: "quantity",
      render: (text, record) => (
          <Space.Compact>
            <InputNumber
              min={1}
              value={record.quantity}
              onChange={(value) => handleQuantityChange(value, record.productCode)}
              disabled={currentStatus && currentStatus !== "PENDING"}
              style={{ width: 100 }}
            />
            <div style={{ padding: '0 8px', display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', border: '1px solid #d9d9d9', borderLeft: 0, borderRadius: '0 6px 6px 0' }}>cái</div>
          </Space.Compact>
      ),
    },
    {
      title: "Đơn giá",
      dataIndex: "price",
      render: (text, record) => (
          <Space.Compact>
            <InputNumber
              min={0}
              value={record.price}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
              style={{ width: 150 }}
              onChange={(value) => handlePriceChange(value, record.productCode)}
              disabled={currentStatus && currentStatus !== "PENDING"}
            />
            <div style={{ padding: '0 8px', display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', border: '1px solid #d9d9d9', borderLeft: 0, borderRadius: '0 6px 6px 0' }}>đ</div>
          </Space.Compact>
      ),
    },
    {
      title: "Thành tiền",
      render: (_, record) => (
        <Text strong style={{ color: "#ff4d4f" }}>
          {((record.quantity || 0) * (record.price || 0)).toLocaleString("vi-VN")}đ
        </Text>
      ),
    },
    {
      title: "Hành động",
      render: (_, record) => (
        <MyButton
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleRemove(record.productCode)}
          disabled={currentStatus && currentStatus !== "PENDING"}
        >
          Xóa
        </MyButton>
      ),
    },
  ];

  if (fetchingDetails) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <Spin size="large" description="Đang tải chi tiết phiếu nhập kho..." />
      </div>
    );
  }

  return (
    <div className="account-admin-container inventory-admin-container">
      <div className="page-header">
        <h1 className="page-title">{id ? "Thông tin phiếu nhập" : "Tạo phiếu nhập"}</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> /{" "}
          <Link to="/admin/inventory-receipts">Quản lý nhập kho</Link> /{" "}
          <span className="active">{id ? `${id}` : "Tạo phiếu nhập"}</span>
        </div>
      </div>

      {id ? (
        <Card
          size="small"
          title={<Text strong>Trạng thái phiếu</Text>}
          style={{ marginBottom: 24 }}
        >
          <Row align="middle" gutter={16}>
            <Col>
              <Text>Trạng thái hiện tại:</Text>
            </Col>
            <Col>
              <Tag color={STATUS_CONFIG[currentStatus]?.color || "default"}>
                {STATUS_CONFIG[currentStatus]?.text || currentStatus}
              </Tag>
            </Col>
            <Col flex="auto">
              {currentStatus !== "PENDING" && (
                <Alert
                  type="info"
                  showIcon
                  title="Phiếu nhập kho đã được xử lý và không thể chỉnh sửa"
                  style={{ marginLeft: 16 }}
                />
              )}
            </Col>
          </Row>

          {currentStatus === "PENDING" && hasPermission(["ROLE_ADMIN", "CRU_RECEIPT"]) && (
            <>
              <Divider style={{ margin: "16px 0" }} />
              <Row align="middle" gutter={16}>
                <Col>
                  <Text>Thay đổi trạng thái:</Text>
                </Col>
                <Col>
                  <Select
                    style={{ width: 180 }}
                    value={status}
                    open={open}
                    onOpenChange={setOpen}
                    onChange={handleStatusChange}
                  >
                    <Option value="PENDING">
                      {STATUS_CONFIG.PENDING.text}
                    </Option>
                    <Option value="COMPLETED">
                      {STATUS_CONFIG.COMPLETED.text}
                    </Option>
                    <Option value="CANCELED">
                      {STATUS_CONFIG.CANCELED.text}
                    </Option>
                  </Select>
                </Col>
                <Col>
                  <MyButton
                    type="primary"
                    onClick={() => handleSubmitStatusChange(status)}
                    disabled={currentStatus === status || submitting}
                    loading={submitting}
                  >
                    Cập nhật trạng thái
                  </MyButton>
                </Col>
                <Col flex="auto">
                  {status === "CANCELED" && (
                    <Alert
                      type="warning"
                      showIcon
                      title="Hủy phiếu sẽ không thể hoàn tác!"
                      style={{ marginLeft: 16 }}
                    />
                  )}
                </Col>
              </Row>
            </>
          )}
        </Card>
      ) : null}

      <Card
        size="small"
        title={<Text strong>Danh sách sản phẩm</Text>}
        extra={
          (currentStatus === 'PENDING' || !id) && (
            <Select
              showSearch
              placeholder="Tìm mã sản phẩm"
              style={{ width: 300 }}
              filterOption={false}
              onSearch={handleSearch}
              onSelect={handleSelect}
              value={null} // Luôn reset về null sau khi chọn để nhập tiếp sản phẩm khác
              notFoundContent={
                loading ? <Spin size="small" /> : "Không có sản phẩm"
              }
              suffixIcon={<PlusOutlined />}
            >
              {products.map((product) => (
                <Option key={product.name} value={product.name} label={`${product.name}`}>
                  {product.name}
                </Option>
              ))}
            </Select>
          )
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

      <Card size="small" title={<Text strong>Thông tin bổ sung</Text>}>
        <Form layout="vertical" form={form}>
          <Form.Item
            label={
              <span>
                <FileTextOutlined style={{ marginRight: 8 }} />
                Ghi chú
              </span>
            }
          >
            <Input.TextArea
              maxLength={255}
              showCount
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Nhập ghi chú về phiếu nhập kho..."
              rows={4}
              disabled={currentStatus && currentStatus !== "PENDING"}
            />
          </Form.Item>

          <Form.Item label="Tổng tiền">
            <Space.Compact style={{ width: "100%" }}>
              <InputNumber
                value={totalAmount}
                disabled
                style={{ width: "100%", color: "#ff4d4f" }}
                formatter={(value) =>
                  `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                }
              />
              <div style={{ padding: '0 12px', display: 'flex', alignItems: 'center', backgroundColor: '#f5f5f5', border: '1px solid #d8d8d8', borderLeft: 0, borderRadius: '0 6px 6px 0' }}>đ</div>
            </Space.Compact>
          </Form.Item>

          <Form.Item>
            <Space>
              <MyButton
                type="primary"
                icon={<SaveOutlined />}
                onClick={handleSubmit}
                disabled={
                  !selectedProducts.length ||
                  (currentStatus && currentStatus !== "PENDING") ||
                  submitting
                }
                loading={submitting}
              >
                {id ? "Cập nhật phiếu" : "Tạo phiếu nhập kho"}
              </MyButton>
              <MyButton>
                <Link to="/admin/inventory-receipts">
                  Quay lại
                </Link>
              </MyButton>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
