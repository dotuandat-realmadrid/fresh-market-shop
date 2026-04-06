import {
  ArrowDownOutlined,
  ArrowRightOutlined,
  ArrowUpOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  HistoryOutlined,
  InfoCircleOutlined,
  LineChartOutlined,
  PictureOutlined,
  ReloadOutlined,
  SaveOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  ShoppingOutlined,
  TagOutlined,
} from "@ant-design/icons";
import {
  App as AntApp,
  Breadcrumb,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  message,
  Modal,
  Progress,
  Rate,
  Row,
  Select,
  Space,
  Statistic,
  Tooltip,
  Typography,
  Upload,
  AutoComplete
} from "antd";
import MyButton from "../../components/MyButton";
import TextArea from "antd/es/input/TextArea";
import dayjs from "dayjs";
import React, { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { IMAGE_URL } from "../../api/auth";
import { getAllDiscount } from "../../api/discount";
import {
  deleteProduct,
  getProductByCode,
  updateProduct,
  updateProductImages,
} from "../../api/product";
import { revenueByProduct } from "../../api/report";
import { useCategories } from "../../context/CategoryContext";
import { useSuppliers } from "../../context/SupplierContext";

const { Title, Text } = Typography;
const { confirm } = Modal;

export default function ProductDetailAdmin() {
  const { message, modal } = AntApp.useApp();
  const [form] = Form.useForm();
  const [productDetail, setProductDetail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveLoading, setSaveLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageLoading, setImageLoading] = useState(false);
  const { categories } = useCategories();
  const { suppliers } = useSuppliers();
  const { code } = useParams();
  const navigate = useNavigate();
  const [discountData, setDiscountData] = useState(null);
  const [revenue, setRevenue] = useState(null);
  const priceWatch = Form.useWatch("price", form);
  const discountNameWatch = Form.useWatch("discountName", form);
  const [calculatedDiscountPrice, setCalculatedDiscountPrice] = useState(0);

  useEffect(() => {
    if (productDetail) {
      setCalculatedDiscountPrice(productDetail.discountPrice || productDetail.price || 0);
    }
  }, [productDetail]);
  const [fileList, setFileList] = useState([]);
  const [existingImages, setExistingImages] = useState([]);

  useEffect(() => {
    const getProductDetail = async () => {
      setLoading(true);
      try {
        const data = await getProductByCode(code);
        setProductDetail(data);

        // Xử lý ảnh sản phẩm
        if (data.images && data.images.length > 0) {
          const images = data.images.map((img, index) => ({
            uid: `existing-${index}`,
            name: img,
            status: "done",
            url: `${IMAGE_URL}/${img}`,
            path: img,
          }));
          setExistingImages(images);
        }
      } catch (error) {
        message.error("Không thể tải thông tin sản phẩm");
      } finally {
        setLoading(false);
      }
    };

    getProductDetail();
  }, [code, navigate]);

  useEffect(() => {
    if (productDetail) {
      const price = Number(productDetail.price) || 0;
      
      const initialValues = {
        ...productDetail,
        price: price,
        discountPrice: Number(productDetail.discountPrice) || price,
        createdDate: productDetail.createdDate ? dayjs(productDetail.createdDate) : null,
        modifiedDate: productDetail.modifiedDate ? dayjs(productDetail.modifiedDate) : null,
      };

      // Cập nhật chi tiết hơn nếu có discountData
      if (Array.isArray(discountData) && productDetail.discountName) {
        const discount = discountData.find(d => d.name === productDetail.discountName);
        if (discount) {
          const percent = Number(discount.percent) || 0;
          initialValues.discountPrice = Math.round(price - (price * percent / 100));
        }
      }

      form.setFieldsValue(initialValues);
    }
  }, [productDetail, discountData, form]);

  const categoryMap = Array.isArray(categories) ? categories.reduce((acc, category) => {
    acc[category.code] = category.code;
    return acc;
  }, {}) : {};

  const supplierMap = Array.isArray(suppliers) ? suppliers.reduce((acc, supplier) => {
    acc[supplier.code] = supplier.code;
    return acc;
  }, {}) : {};

  const handleCancel = () => {
    modal.confirm({
      title: "Hủy thay đổi?",
      icon: <ExclamationCircleOutlined />,
      content:
        "Bạn có chắc chắn muốn hủy các thay đổi? Tất cả dữ liệu chưa lưu sẽ bị mất.",
      onOk() {
        form.resetFields();
        if (productDetail) {
          form.setFieldsValue({
            ...productDetail,
            createdDate: productDetail.createdDate ? dayjs(productDetail.createdDate) : null,
            modifiedDate: productDetail.modifiedDate ? dayjs(productDetail.modifiedDate) : null,
          });
        }

        // Reset file list và existing images
        setFileList([]);
        if (productDetail && productDetail.images) {
          const images = productDetail.images.map((img, index) => ({
            uid: `existing-${index}`,
            name: img,
            status: "done",
            url: `${IMAGE_URL}/${img}`,
            path: img,
          }));
          setExistingImages(images);
        }

        message.info("Đã hủy thay đổi");
      },
    });
  };

  const onSubmit = async (values) => {
    modal.confirm({
      title: "Xác nhận cập nhật",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật thông tin sản phẩm này?",
      async onOk() {
        setSaveLoading(true);
        try {
          const discountId =
            Array.isArray(discountData) ? (discountData.find((d) => d.name === values.discountName)?.id ||
            values.discountName ||
            null) : null;

          // Đảm bảo ép kiểu price về số (long) và loại bỏ các ký tự phân cách nếu có
          const price = values.price ? parseInt(values.price.toString().replace(/,/g, ''), 10) : 0;

          const data = {
            categoryCodes: values.categoryCodes,
            supplierCode: values.supplierCode,
            name: values.name,
            branch: values.branch,
            description: values.description,
            price: price,
            discountId: discountId || null,
          };

          await updateProduct(values.id, data);
          message.success("Cập nhật sản phẩm thành công");

          // Reload product data after update
          const updatedProduct = await getProductByCode(code);
          setProductDetail(updatedProduct);
        } catch (error) {
          message.error(error.message || "Cập nhật sản phẩm thất bại");
        } finally {
          setSaveLoading(false);
        }
      },
    });
  };

  const handleDelete = () => {
    modal.confirm({
      title: "Xác nhận xóa sản phẩm",
      icon: <ExclamationCircleOutlined />,
      content:
        "Bạn có chắc chắn muốn xóa sản phẩm này? Hành động này không thể hoàn tác.",
      okText: "Xóa",
      okType: "danger",
      async onOk() {
        setDeleteLoading(true);
        try {
          await deleteProduct(productDetail.id);
          navigate("/admin/products");
        } catch (error) {
          message.error("Xóa sản phẩm thất bại");
          setDeleteLoading(false);
        }
      },
    });
  };

  useEffect(() => {
    const getDiscounts = async () => {
      try {
        const data = await getAllDiscount();
        setDiscountData(data);
      } catch (error) {
        message.error("Không thể tải danh sách mã giảm giá");
      }
    };

    getDiscounts();
  }, []);

  useEffect(() => {
    const currentPrice = typeof priceWatch === 'number' 
      ? priceWatch 
      : (priceWatch ? Number(priceWatch.toString().replace(/,/g, '')) : (productDetail?.price || 0));
      
    const discount = Array.isArray(discountData) ? discountData.find(d => d.name === discountNameWatch) : null;
    
    let newDiscountPrice = currentPrice;
    if (discount) {
      const percent = Number(discount.percent) || 0;
      newDiscountPrice = currentPrice - (currentPrice * percent / 100);
    }
    
    // Nếu chưa chọn mã mới, dùng % từ mã cũ của sản phẩm
    if (!discount && !discountNameWatch && productDetail?.discountName) {
        const originalDiscount = Array.isArray(discountData) ? discountData.find(d => d.name === productDetail.discountName) : null;
        if (originalDiscount) {
            const percent = Number(originalDiscount.percent) || 0;
            newDiscountPrice = currentPrice - (currentPrice * percent / 100);
        }
    }
    
    const finalPrice = Math.round(newDiscountPrice);
    setCalculatedDiscountPrice(finalPrice);
  }, [priceWatch, discountNameWatch, discountData, productDetail]);

  const handleReport = async (productCode) => {
    const data = await revenueByProduct(productCode);
    setRevenue(data);
  };

  // Xử lý upload ảnh
  const handleImageChange = ({ fileList: newFileList }) => {
    // Lọc ra những file mới upload lên (không phải existing images)
    const newFiles = newFileList.filter(
      (file) => !file.uid.startsWith("existing-")
    );
    setFileList(newFiles);
  };

  const handleRemoveExistingImage = (file) => {
    setExistingImages((prev) => prev.filter((item) => item.uid !== file.uid));
  };

  const handleSaveImages = async () => {
    if (!productDetail) return;

    modal.confirm({
      title: "Xác nhận cập nhật ảnh",
      icon: <ExclamationCircleOutlined />,
      content: "Bạn có chắc chắn muốn cập nhật ảnh cho sản phẩm này?",
      async onOk() {
        setImageLoading(true);
        try {
          // Lấy danh sách đường dẫn ảnh cần giữ lại
          const keepImages = existingImages.map((img) => img.path);
          console.log(keepImages);

          // Lấy danh sách file mới
          const files = fileList.map((file) => file.originFileObj);

          // Gọi API cập nhật ảnh
          await updateProductImages(productDetail.id, keepImages, files);

          // Reload product data
          const updatedProduct = await getProductByCode(code);
          setProductDetail(updatedProduct);

          // Cập nhật lại danh sách ảnh
          if (updatedProduct.images && updatedProduct.images.length > 0) {
            const images = updatedProduct.images.map((img, index) => ({
              uid: `existing-${index}`,
              name: img,
              status: "done",
              url: `${IMAGE_URL}/${img}`,
              path: img,
            }));
            setExistingImages(images);
          } else {
            setExistingImages([]);
          }

          // Reset file list
          setFileList([]);
        } catch (error) {
          message.error(
            "Cập nhật ảnh thất bại: " + (error.message || "Lỗi không xác định")
          );
        } finally {
          setImageLoading(false);
        }
      },
    });
  };

  const uploadProps = {
    onRemove: (file) => {
      if (file.uid.startsWith("existing-")) {
        handleRemoveExistingImage(file);
      } else {
        const index = fileList.indexOf(file);
        const newFileList = fileList.slice();
        newFileList.splice(index, 1);
        setFileList(newFileList);
      }
    },
    beforeUpload: (file) => {
      // Kiểm tra kiểu file là hình ảnh
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error(`${file.name} không phải là file hình ảnh!`);
        return Upload.LIST_IGNORE;
      }

      // Thêm file vào fileList
      setFileList((prev) => [
        ...prev,
        { ...file, status: "done", uid: file.uid, originFileObj: file },
      ]);
      return false;
    },
    fileList: [...existingImages, ...fileList],
    listType: "picture-card",
    onChange: handleImageChange,
    showUploadList: {
      showPreviewIcon: true,
      showRemoveIcon: true,
    },
  };

  return (
    <>
      <div className="page-header">
        <h1 className="page-title">Thông tin sản phẩm</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> / <Link to="/admin/products">Quản lý sản phẩm</Link> / <span className="active">{productDetail?.name}</span>
        </div>
      </div>

      <Row gutter={[16]}>
        <Col xl={18}>
          <Card
            loading={loading}
            title={
              <Space>
                <Title level={4} style={{ margin: 0 }}>
                  Thông tin cơ bản
                </Title>
              </Space>
            }
            extra={
              <Space>
                <Tooltip title="Hủy thay đổi">
                  <MyButton onClick={handleCancel} icon={<ReloadOutlined />}>
                    Hủy
                  </MyButton>
                </Tooltip>
                <Tooltip title="Cập nhật sản phẩm">
                  <MyButton
                    type="primary"
                    icon={<SaveOutlined />}
                    loading={saveLoading}
                    onClick={() => form.submit()}
                  >
                    Cập nhật
                  </MyButton>
                </Tooltip>
                <Tooltip title="Xóa sản phẩm">
                  <MyButton
                    danger
                    icon={<DeleteOutlined />}
                    onClick={handleDelete}
                    loading={deleteLoading}
                  >
                    Xóa
                  </MyButton>
                </Tooltip>
                {productDetail && (
                  <Tooltip title="Xem lịch sử nhập kho">
                    <Link
                      to={`/admin/inventory-receipt-details?productId=${productDetail.id}`}
                      state={{
                        productCode: productDetail.code,
                        productName: productDetail.name,
                      }}
                    >
                      <MyButton type="primary" ghost icon={<HistoryOutlined />}>
                        
                      </MyButton>
                    </Link>
                  </Tooltip>
                )}
                {productDetail && (
                  <Tooltip title="Báo cáo lợi nhuận">
                    <MyButton
                      type="primary"
                      icon="💰"
                      onClick={() => handleReport(productDetail.code)}
                    >
                      Lợi nhuận
                    </MyButton>
                  </Tooltip>
                )}
              </Space>
            }
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onSubmit}
            >
              <Row gutter={[24, 0]}>
                <Col span={24} lg={10}>
                  <Form.Item label="ID" name="id">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={24} lg={2}></Col>
                <Col span={24} lg={10}>
                  <Form.Item label="Mã sản phẩm" name="code">
                    <Input disabled />
                  </Form.Item>
                </Col>
                <Col span={24} lg={2}></Col>
              </Row>

              <Divider titlePlacement="left">
                <Space>
                  <ShopOutlined />
                  <span>Thông tin cơ bản</span>
                </Space>
              </Divider>

              <Row gutter={[24, 0]}>
                <Col span={24} lg={16}>
                  <Form.Item
                    label="Tên sản phẩm"
                    name="name"
                    rules={[
                      { required: true, message: "Vui lòng nhập tên sản phẩm!" },
                    ]}
                  >
                    <Input placeholder="Nhập tên sản phẩm" />
                  </Form.Item>
                </Col>
                <Col span={24} lg={8}>
                  <Form.Item
                    label="Thương hiệu"
                    name="branch"
                    rules={[
                      { required: true, message: "Vui lòng nhập thương hiệu!" },
                    ]}
                  >
                    <AutoComplete placeholder="Nhập thương hiệu" />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={[24, 0]}>
                <Col span={24} lg={16}>
                  <Form.Item
                    label="Danh mục"
                    name="categoryCodes"
                    rules={[
                      { required: true, message: "Vui lòng chọn danh mục!" },
                    ]}
                  >
                    <Select
                      placeholder="Chọn danh mục"
                      showSearch
                      mode="multiple"
                      allowClear
                      optionFilterProp="children"
                    >
                      {Array.isArray(categories) && categories.map((category) => (
                        <Select.Option
                          key={category.code}
                          value={category.code}
                        >
                          {category.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>

                <Col span={24} lg={8}>
                  <Form.Item
                    label="Nhà cung cấp"
                    name="supplierCode"
                    rules={[
                      {
                        required: true,
                        message: "Vui lòng chọn nhà cung cấp!",
                      },
                    ]}
                  >
                    <Select
                      placeholder="Chọn nhà cung cấp"
                      showSearch
                      optionFilterProp="children"
                    >
                      {Array.isArray(suppliers) && suppliers.map((supplier) => (
                        <Select.Option
                          key={supplier.code}
                          value={supplier.code}
                        >
                          {supplier.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Card
                size="small"
                variant="outlined"
                style={{ marginBottom: 24 }}
                extra={
                  <MyButton
                    type="primary"
                    icon={<SaveOutlined />}
                    onClick={handleSaveImages}
                    loading={imageLoading}
                    disabled={
                      fileList.length === 0 &&
                      existingImages.length === productDetail?.images?.length
                    }
                  >
                    Lưu ảnh
                  </MyButton>
                }
              >
                <Upload {...uploadProps}>
                  <div>
                    <PictureOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                </Upload>
              </Card>

              <Divider titlePlacement="left">
                <Space>
                  <TagOutlined />
                  <span>Giá và khuyến mãi</span>
                </Space>
              </Divider>

              <Row gutter={[24, 0]}>
                <Col span={24} lg={8}>
                  <Form.Item
                    label="Giá gốc"
                    name="price"
                    rules={[{ required: true, message: "Vui lòng nhập giá!" }]}
                  >
                    <InputNumber
                      min={0}
                      max={1e9}
                      placeholder="Nhập giá"
                      style={{ width: "100%" }}
                      suffix="VNĐ"
                      formatter={(value) =>
                        `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                      }
                      parser={(value) => value.replace(/\$\s?|(,*)/g, "")}
                    />
                  </Form.Item>
                </Col>

                <Col span={24} lg={8}>
                  <Form.Item label="Giá sau giảm">
                    <Space.Compact style={{ width: "100%" }}>
                      <InputNumber
                        disabled
                        value={calculatedDiscountPrice}
                        style={{ width: "calc(100% - 60px)" }}
                        formatter={(value) =>
                          `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
                        }
                      />
                      <MyButton disabled style={{ width: "60px" }}>VNĐ</MyButton>
                    </Space.Compact>
                  </Form.Item>
                </Col>

                <Col span={24} lg={8}>
                  <Form.Item label="Chọn mã giảm giá" name="discountName">
                    <Select
                      placeholder="--- Chọn mã giảm giá ---"
                      style={{ width: "100%" }}
                      loading={!discountData}
                    >
                      <Select.Option value={""}>Bỏ chọn</Select.Option>
                      {Array.isArray(discountData) && discountData.map((discount) => (
                        <Select.Option
                          key={discount.id}
                          value={discount.name}
                        >
                          {discount.name}
                        </Select.Option>
                      ))}
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              {calculatedDiscountPrice < (typeof priceWatch === 'number' ? priceWatch : Number(priceWatch?.toString().replace(/,/g, '')) || productDetail?.price) && (
                <div style={{ marginBottom: 24 }}>
                  <Card
                    size="small"
                    style={{
                      background: "#f9f9f9",
                      border: "1px dashed #d9d9d9",
                    }}
                  >
                    <div style={{ fontSize: "15px" }}>
                      Giá gốc:{" "}
                      <Text strong>
                        {(typeof priceWatch === 'number' ? priceWatch : (priceWatch ? Number(priceWatch.toString().replace(/,/g, '')) : (productDetail?.price || 0))).toLocaleString()} VNĐ
                      </Text>
                      <ArrowRightOutlined style={{ margin: "0 12px", color: "#64748b" }} />
                      Giá khuyến mãi:{" "}
                      <Text strong style={{ color: "#ef4444" }}>
                        {calculatedDiscountPrice.toLocaleString()} VNĐ
                      </Text>
                      <span style={{ color: "#64748b", marginLeft: "8px" }}>
                        (Tiết kiệm:{" "}
                        {(
                          (typeof priceWatch === 'number' ? priceWatch : (priceWatch ? Number(priceWatch.toString().replace(/,/g, '')) : (productDetail?.price || 0))) - calculatedDiscountPrice
                        ).toLocaleString()}{" "}
                        VNĐ)
                      </span>
                    </div>
                  </Card>
                </div>
              )}

              <Divider titlePlacement="left">
                <Space>
                  <ShoppingOutlined />
                  <span>Thông tin kho hàng và đánh giá</span>
                </Space>
              </Divider>

              <Row gutter={[24, 16]}>
                <Col span={8}>
                  <Card size="small" variant="outlined">
                    <Statistic
                      title={<Text strong>Số lượng tồn kho</Text>}
                      value={productDetail?.inventoryQuantity || 0}
                      styles={{ content: { color: "#1890ff" } }}
                    />
                    <Form.Item name="inventoryQuantity" hidden>
                      <Input />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card size="small" variant="outlined">
                    <Statistic
                      title={<Text strong>Số lượng đã bán</Text>}
                      value={productDetail?.soldQuantity || 0}
                      styles={{ content: { color: "#52c41a" } }}
                    />
                    <Form.Item name="soldQuantity" hidden>
                      <Input />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={8}>
                  <Card size="small" variant="outlined">
                    <div>
                      <Text strong>Đánh giá sản phẩm</Text>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginTop: 4,
                        }}
                      >
                        <Rate
                          disabled
                          value={
                            Math.round(productDetail?.avgRating * 2) / 2 || 2.5
                          }
                          allowHalf
                        />
                        <Text style={{ marginLeft: 8 }}>
                          {productDetail?.avgRating?.toFixed(1) || "0.0"}
                          <Text type="secondary">{` (${
                            productDetail?.reviewCount || 0
                          } đánh giá)`}</Text>
                        </Text>
                      </div>
                    </div>
                    <Form.Item name="point" hidden>
                      <Input />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>

              <Form.Item
                label="Mô tả sản phẩm"
                name="description"
                tooltip={{
                  title: "Mô tả chi tiết về sản phẩm",
                  icon: <InfoCircleOutlined />,
                }}
                style={{
                  marginTop: 24,
                }}
              >
                <TextArea
                  rows={6}
                  placeholder="Nhập mô tả sản phẩm"
                  showCount
                  maxLength={5000}
                />
              </Form.Item>

              <Divider titlePlacement="left">
                <Space>
                  <InfoCircleOutlined />
                  <span>Thông tin thêm</span>
                </Space>
              </Divider>

              <Row gutter={[24, 16]}>
                <Col span={24} md={12}>
                  <Card size="small" title="Thông tin tạo" variant="outlined">
                    <Form.Item label="Ngày tạo" name="createdDate">
                      <DatePicker
                        showTime
                        style={{ width: "100%" }}
                        disabled
                        format="DD/MM/YYYY HH:mm:ss"
                      />
                    </Form.Item>

                    <Form.Item label="Người tạo" name="createdBy">
                      <Input disabled />
                    </Form.Item>
                  </Card>
                </Col>

                <Col span={24} md={12}>
                  <Card size="small" title="Thông tin cập nhật" variant="outlined">
                    <Form.Item label="Ngày cập nhật" name="modifiedDate">
                      <DatePicker
                        showTime
                        style={{ width: "100%" }}
                        disabled
                        format="DD/MM/YYYY HH:mm:ss"
                      />
                    </Form.Item>

                    <Form.Item label="Người cập nhật" name="modifiedBy">
                      <Input disabled />
                    </Form.Item>
                  </Card>
                </Col>
              </Row>
            </Form>
          </Card>
        </Col>

        {revenue && (
          <Col xl={6}>
            <Card
              size="small"
              className="revenue-card"
              variant="borderless"
              style={{
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.06)",
                background: "white",
              }}
              title={
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <span
                    style={{
                      fontSize: "14px",
                      fontWeight: "600",
                      color: "#1F2937",
                    }}
                  >
                    <LineChartOutlined style={{ marginRight: "6px" }} />
                    Báo Cáo Lợi Nhuận
                  </span>
                </div>
              }
            >
              <Row gutter={[8, 8]}>
                <Col span={12}>
                  <div style={{ padding: "4px 0" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Tổng số lượng nhập
                    </Text>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <ShoppingOutlined
                        style={{ marginRight: "4px", color: "#6B7280" }}
                      />
                      <Text strong style={{ fontSize: "14px" }}>
                        {revenue.totalInventoryQuantity}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: "4px 0" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Tổng giá nhập
                    </Text>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text strong style={{ fontSize: "14px" }}>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(revenue.totalRevenuePrice)}
                      </Text>
                    </div>
                  </div>
                </Col>
                <Col span={12}>
                  <div style={{ padding: "4px 0" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Số lượng đã bán
                    </Text>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <ShoppingCartOutlined
                        style={{ marginRight: "4px", color: "#6B7280" }}
                      />
                      <Text strong style={{ fontSize: "14px" }}>
                        {revenue.totalSoldQuantity}
                        <Text
                          type="secondary"
                          style={{ fontSize: "12px", marginLeft: "2px" }}
                        >
                          /{revenue.totalInventoryQuantity}
                        </Text>
                      </Text>
                    </div>
                  </div>
                    <Progress
                      percent={Math.round(
                        (revenue.totalSoldQuantity /
                          revenue.totalInventoryQuantity) *
                          100
                      )}
                      showInfo={false}
                      size={{ strokeWidth: 4 }}
                      strokeColor="#4338CA"
                    />
                </Col>
                <Col span={12}>
                  <div style={{ padding: "4px 0" }}>
                    <Text type="secondary" style={{ fontSize: "12px" }}>
                      Tổng doanh thu
                    </Text>
                    <div style={{ display: "flex", alignItems: "center" }}>
                      <Text strong style={{ fontSize: "14px" }}>
                        {new Intl.NumberFormat("vi-VN", {
                          style: "currency",
                          currency: "VND",
                          maximumFractionDigits: 0,
                        }).format(revenue.totalRevenue)}
                      </Text>
                    </div>
                  </div>
                </Col>
              </Row>

              <div
                style={{
                  marginTop: "8px",
                  padding: "8px",
                  borderRadius: "6px",
                  background:
                    revenue.totalRevenue - revenue.totalRevenuePrice >= 0
                      ? "rgba(220, 252, 231, 0.4)"
                      : "rgba(254, 226, 226, 0.4)",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Text style={{ fontSize: "12px" }}>Lợi nhuận:</Text>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    {revenue.totalRevenue - revenue.totalRevenuePrice < 0 ? (
                      <ArrowDownOutlined
                        style={{ color: "#EF4444", fontSize: "12px" }}
                      />
                    ) : (
                      <ArrowUpOutlined
                        style={{ color: "#10B981", fontSize: "12px" }}
                      />
                    )}
                    <Text
                      strong
                      style={{
                        fontSize: "14px",
                        color:
                          revenue.totalRevenue - revenue.totalRevenuePrice < 0
                            ? "#EF4444"
                            : "#10B981",
                        marginLeft: "4px",
                      }}
                    >
                      {new Intl.NumberFormat("vi-VN", {
                        style: "currency",
                        currency: "VND",
                        maximumFractionDigits: 0,
                      }).format(
                        revenue.totalRevenue - revenue.totalRevenuePrice
                      )}
                      <Text
                        style={{
                          fontSize: "12px",
                          color:
                            revenue.totalRevenue - revenue.totalRevenuePrice < 0
                              ? "#EF4444"
                              : "#10B981",
                          marginLeft: "4px",
                        }}
                      >
                        (
                        {Math.abs(
                          (
                            ((revenue.totalRevenue -
                              revenue.totalRevenuePrice) /
                              revenue.totalRevenuePrice) *
                            100
                          ).toFixed(1)
                        ) || 0 }
                        %)
                      </Text>
                    </Text>
                  </div>
                </div>
              </div>
            </Card>
          </Col>
        )}
      </Row>
    </>
  );
}
