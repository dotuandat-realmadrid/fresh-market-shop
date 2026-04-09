import { Button, Divider, Form, Input, Select, Row, Col, Space } from "antd";
import { PictureOutlined, CameraOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import { useSuppliers } from "../context/SupplierContext";
import { useCategories } from "../context/CategoryContext.jsx";
import { IMAGE_URL } from "../api/auth";

const { Option } = Select;

export default function CategoryForm({
  initValues,
  onSubmit,
  submitButtonText,
  isUpdate,
  isCategory,
  onImageChange,
}) {
  const [form] = Form.useForm();
  const [previewUrl, setPreviewUrl] = useState(null);
  const fileInputRef = useRef(null);

  const supplierContext = useSuppliers();
  const suppliers = supplierContext?.suppliers || [];

  const categoryContext = useCategories();
  const categories = categoryContext?.categories || [];

  const supplierOptions = suppliers.map((supplier) => ({
    value: supplier.code,
    label: supplier.name,
    key: supplier.code,
  }));


  useEffect(() => {
    if (initValues) {
      form.setFieldsValue({
        code: initValues.code,
        name: initValues.name,
        description: initValues.description,
        level: initValues.level,
        parentCodes: initValues.parents
          ? initValues.parents.map((p) => p.code || p)
          : initValues.parent
            ? [initValues.parent.code || initValues.parent]
            : [],
        supplierCodes: initValues.suppliers
          ? initValues.suppliers.map((supplier) => supplier.code || supplier)
          : initValues.supplier
            ? [initValues.supplier.code || initValues.supplier]
            : [],
      });
      if (initValues.imagePath) {
        setPreviewUrl(`${IMAGE_URL}/${initValues.imagePath}`);
      } else {
        setPreviewUrl(null);
      }
    }

    if (!isUpdate) {
      form.resetFields();
      setPreviewUrl(null);
    }
  }, [initValues, form, isUpdate]);

  const handleLevelChange = (value) => {
    form.setFieldsValue({ parentCodes: [] });
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    if (onImageChange) onImageChange(file);
    e.target.value = "";
  };

  return (
    <div className="category-form-wrapper">
      <Form
        form={form}
        onFinish={onSubmit}
        layout="vertical"
        style={{ width: "100%" }}
        initialValues={initValues}
        requiredMark="optional"
      >
        <Row gutter={[20, 0]}>
          {/* Layout cho Category: Ảnh (trái) - Info (phải) */}
          {isCategory && (
            <Col span={8}>
              <Form.Item label="Hình ảnh" style={{ marginBottom: 12 }}>
                <div
                  onClick={handleImageClick}
                  style={{
                    width: "70%",
                    aspectRatio: "1/1",
                    border: "2px dashed #e1e4e8",
                    borderRadius: "14px",
                    cursor: "pointer",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    overflow: "hidden",
                    background: "#f9fafb",
                    transition: "all 0.4s cubic-bezier(0.165, 0.84, 0.44, 1)",
                    boxShadow: "inset 0 1px 2px rgba(0,0,0,0.02)",
                    position: "relative",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = "#1677ff";
                    e.currentTarget.style.background = "#f0f7ff";
                    e.currentTarget.style.transform = "translateY(-2px)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = "#e1e4e8";
                    e.currentTarget.style.background = "#f9fafb";
                    e.currentTarget.style.transform = "translateY(0)";
                  }}
                >
                  {previewUrl ? (
                    <>
                      <img
                        src={previewUrl}
                        alt="preview"
                        style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      />
                      <div style={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        height: "40%",
                        background: "linear-gradient(to top, rgba(0,0,0,0.6), transparent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "#fff",
                        gap: 6
                      }}>
                        <CameraOutlined style={{ fontSize: 18 }} />
                        <span style={{ fontSize: 13, fontWeight: 500 }}>Sửa ảnh</span>
                      </div>
                    </>
                  ) : (
                    <Space orientation="vertical" align="center" size={4}>
                      <PictureOutlined style={{ fontSize: 36, color: "#d1d5db" }} />
                      <span style={{ fontSize: 13, color: "#9ca3af", fontWeight: 500 }}>Thêm ảnh</span>
                    </Space>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={handleFileChange}
                />
              </Form.Item>
            </Col>
          )}

          {/* Cột các trường thông tin cơ bản */}
          <Col span={isCategory ? 16 : 24}>
            <Row gutter={12}>
              {!isUpdate && (
                <Col span={isCategory ? 12 : 12}>
                  <Form.Item
                    name="code"
                    label="Mã code"
                    rules={[{ required: true, message: "Bắt buộc nhập mã" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="Mã code" />
                  </Form.Item>
                </Col>
              )}
              {isCategory && (
                <Col span={!isUpdate ? 12 : 8}>
                  <Form.Item
                    name="level"
                    label="Phân cấp"
                    rules={[{ required: true, message: "Chọn cấp độ" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Select placeholder="Cấp độ" onChange={handleLevelChange}>
                      <Option value={1}>Cấp 1</Option>
                      <Option value={2}>Cấp 2</Option>
                      <Option value={3}>Cấp 3</Option>
                    </Select>
                  </Form.Item>
                </Col>
              )}
              {/* Nếu là Supplier, cho name nằm cạnh code nếu không phải update */}
              {!isCategory && (
                 <Col span={!isUpdate ? 12 : 24}>
                  <Form.Item
                    name="name"
                    label="Tên nhà cung cấp"
                    rules={[{ required: true, message: "Nhập tên nhà cung cấp" }]}
                    style={{ marginBottom: 12 }}
                  >
                    <Input placeholder="Tên nhà cung cấp" />
                  </Form.Item>
                </Col>
              )}
            </Row>

            {isCategory && (
              <Form.Item
                name="name"
                label="Tên danh mục"
                rules={[{ required: true, message: "Nhập tên danh mục" }]}
                style={{ marginBottom: 12 }}
              >
                <Input placeholder="Tên danh mục" />
              </Form.Item>
            )}

            {isCategory && (
              <Form.Item
                name="description"
                label="Mô tả"
                rules={[{ required: true, message: "Nhập mô tả" }]}
                style={{ marginBottom: 0 }}
              >
                <Input placeholder="Mô tả" />
              </Form.Item>
            )}
          </Col>
        </Row>

        {/* Các trường mở rộng nằm ở dưới cùng cùng hàng để tiết kiệm diện tích */}
        {isCategory && (
          <Row gutter={16}>
            <Col span={10}>
              <Form.Item name="supplierCodes" label="Nhà cung cấp hỗ trợ" style={{ marginBottom: 0 }}>
                <Select
                  mode="multiple"
                  placeholder="Chọn nhà cung cấp"
                  options={supplierOptions}
                  optionFilterProp="label"
                  allowClear
                  showSearch
                />
              </Form.Item>
            </Col>
             <Col span={14}>
              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.level !== currentValues.level}
              >
                {({ getFieldValue }) => {
                  const currentLevel = getFieldValue("level");
                  const filteredOptions = categories
                    .filter((cat) => (!initValues || cat.code !== initValues.code) && cat.level === currentLevel - 1)
                    .map((cat) => ({
                      value: cat.code,
                      label: `${cat.name} (Cấp ${cat.level})`,
                      key: cat.code,
                    }));

                  return currentLevel > 1 ? (
                    <Form.Item
                      name="parentCodes"
                      label="Danh mục cha trực tiếp"
                      rules={[{ required: true, message: "Vui lòng chọn cha" }]}
                      style={{ marginBottom: 12 }}
                    >
                      <Select
                        mode="multiple"
                        placeholder="Chọn cha phù hợp"
                        options={filteredOptions}
                        allowClear
                        showSearch
                        optionFilterProp="label"
                      />
                    </Form.Item>
                  ) : null;
                }}
              </Form.Item>
            </Col>
          </Row>
        )}

        <Divider style={{ margin: "20px 0 16px 0" }} />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
          <Button 
            type="primary" 
            htmlType="submit" 
            style={{ 
              minWidth: 130, 
              height: 40, 
              borderRadius: 6,
              fontWeight: 600,
            }}
          >
            {submitButtonText}
          </Button>
        </div>
      </Form>
    </div>
  );
}
