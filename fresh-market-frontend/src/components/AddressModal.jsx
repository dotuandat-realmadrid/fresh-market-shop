import { Col, Form, Input, Modal, Row, Checkbox } from "antd";
import { useEffect } from "react";
import dayjs from "dayjs";
import customParseFormat from "dayjs/plugin/customParseFormat";

dayjs.extend(customParseFormat);

export default function AddressModal({
  visible,
  onCancel,
  onSubmit,
  initValues = {},
  isUpdateAdmin,
}) {
  const [form] = Form.useForm();

  useEffect(() => {
    if (initValues) {
      const updatedValues = {
        ...initValues,
        createdDate: initValues.createdDate
          ? dayjs(initValues.createdDate).format("YYYY-MM-DD HH:mm:ss")
          : null,
        modifiedDate: initValues.modifiedDate
          ? dayjs(initValues.modifiedDate).format("YYYY-MM-DD HH:mm:ss")
          : null,
      };

      form.setFieldsValue(updatedValues);
    }
  }, [initValues, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        onSubmit(values);
        form.resetFields();
      })
      .catch((info) => {
        console.error("Validation failed:", info);
      });
  };

  return (
    <Modal
      title={initValues?.id ? "Cập nhật địa chỉ" : "Thêm địa chỉ mới"}
      open={visible}
      onOk={handleOk}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      okText="Lưu"
      cancelText="Hủy"
      style={{ minWidth: 600 }}
    >
      <Form form={form} layout="vertical">
        {isUpdateAdmin && (
          <Form.Item label="ID" name="id">
            <Input disabled />
          </Form.Item>
        )}
        <Row gutter={[10]}>
          <Col xl={12}>
            <Form.Item
              label="Họ và Tên"
              name="fullName"
              rules={[{ required: true, message: "Vui lòng nhập họ và tên" }]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xl={12}>
            <Form.Item
              label="Số Điện Thoại"
              name="phone"
              rules={[
                { required: true, message: "Vui lòng nhập số điện thoại" },
                {
                  pattern: /^[0-9]{10}$/,
                  message: "Số điện thoại không hợp lệ",
                },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[10]}>
          <Col xl={8}>
            <Form.Item
              label="Tỉnh/Thành Phố"
              name="province"
              rules={[
                { required: true, message: "Vui lòng nhập tỉnh/thành phố" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xl={8}>
            <Form.Item
              label="Quận/Huyện"
              name="district"
              rules={[
                { required: true, message: "Vui lòng nhập quận/huyện" },
              ]}
            >
              <Input />
            </Form.Item>
          </Col>
          <Col xl={8}>
            <Form.Item
              label="Xã/Phường"
              name="ward"
              rules={[{ required: true, message: "Vui lòng nhập xã/phường" }]}
            >
              <Input />
            </Form.Item>
          </Col>
        </Row>

        <Form.Item
          label="Địa Chỉ Chi Tiết"
          name="detail"
          rules={[
            { required: true, message: "Vui lòng nhập địa chỉ chi tiết" },
          ]}
        >
          <Input />
        </Form.Item>

        {isUpdateAdmin && (
          <Row gutter={[10]}>
            <Col xl={12}>
              <Form.Item label="Ngày Tạo" name="createdDate">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xl={12}>
              <Form.Item label="Người Tạo" name="createdBy">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xl={12}>
              <Form.Item label="Ngày Sửa" name="modifiedDate">
                <Input disabled />
              </Form.Item>
            </Col>
            <Col xl={12}>
              <Form.Item label="Người Sửa" name="modifiedBy">
                <Input disabled />
              </Form.Item>
            </Col>
          </Row>
        )}
      </Form>
    </Modal>
  );
}
