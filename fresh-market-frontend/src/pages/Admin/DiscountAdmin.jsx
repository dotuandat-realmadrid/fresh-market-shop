import { DeleteOutlined, EditOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';
import './AccountAdmin.css';
import {
  createDiscount,
  deleteDiscount,
  getAllDiscount,
  updateDiscount,
} from "../../api/discount";

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function DiscountAdmin() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountData, setDiscountData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();

  // Fetch data
  useEffect(() => {
    const getDiscounts = async () => {
      setLoading(true);
      try {
        const data = await getAllDiscount();
        setDiscountData(data || []);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    getDiscounts();
  }, []);

  // Mở modal cho "Thêm mới"
  const showCreateModal = () => {
    setEditingDiscount(null);
    setIsModalVisible(true);
    setTimeout(() => {
      form.resetFields();
    }, 0);
  };

  // Mở modal cho "Cập nhật"
  const showUpdateModal = (discount) => {
    setEditingDiscount(discount);
    setIsModalVisible(true);
    setTimeout(() => {
      form.setFieldsValue({
        ...discount,
        range:
          discount.startDate && discount.endDate
            ? [dayjs(discount.startDate), dayjs(discount.endDate)]
            : [],
      });
    }, 0);
  };

  // Đóng modal và reset form
  const handleCancelModal = () => {
    setIsModalVisible(false);
    form.resetFields();
  };

  // Xử lý submit form
  const handleSubmit = async (values) => {
    const formattedValues = {
      ...values,
      startDate: values.range ? values.range[0].format("YYYY-MM-DD") : null,
      endDate: values.range ? values.range[1].format("YYYY-MM-DD") : null,
    };

    if (values?.id) {
      await updateDiscount(values.id, formattedValues);
    } else {
      await createDiscount(formattedValues);
    }

    // Reload data after update
    setLoading(true);
    const data = await getAllDiscount();
    setDiscountData(data || []);
    setLoading(false);

    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (discount) => {
    await deleteDiscount(discount.id);

    // Reload data after delete
    setLoading(true);
    const data = await getAllDiscount();
    setDiscountData(data || []);
    setLoading(false);
  };

  const showDeleteConfirm = (discount) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa mã giảm giá này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        await handleDelete(discount);
      },
    });
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 60,
      align: "center",
      render: (_, __, index) => index + 1,
    },
    {
      title: "Tên mã giảm giá",
      dataIndex: "name",
      key: "name",
      align: "center",
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Phần trăm giảm giá",
      dataIndex: "percent",
      key: "percent",
      align: "center",
      render: (percent) => <span>{percent.toFixed(2)}%</span>,
    },
    {
      title: "Ngày bắt đầu",
      dataIndex: "startDate",
      key: "startDate",
      align: "center",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Ngày kết thúc",
      dataIndex: "endDate",
      key: "endDate",
      align: "center",
      render: (date) => date ? dayjs(date).format("DD/MM/YYYY") : "N/A",
    },
    {
      title: "Hành động",
      key: "action",
      width: 100,
      align: "center",
      render: (discount) => (
        <Space size="small">
          <Tooltip title="Cập nhật">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showUpdateModal(discount)}
            >
            </Button>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(discount)}
            >
            </Button>
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="account-admin-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý mã giảm giá</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> / <Link to="/admin/discounts">Quản lý mã giảm giá</Link> / <span className="active">Danh sách mã giảm giá</span>
        </div>
      </div>

      <div className="admin-card">
        {/* Action Row */}
        <div className="table-actions-row">
          <div className="stats">
            Tổng số: <span className="count">{discountData?.length || 0}</span> mã giảm giá
          </div>
          <button className="btn-add" onClick={showCreateModal}>
            <FaPlus /> Thêm mới
          </button>
        </div>

        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table
            dataSource={discountData}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
            size="middle"
            loading={loading}
          />
        </div>
      </div>

      <Modal
        title={
          <span>
            {editingDiscount ? "Cập nhật mã giảm giá" : "Thêm mới mã giảm giá"}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnHidden={true}
        width={400}
        mask={{ closable: false }}
        centered
      >
        <Form
          form={form}
          onFinish={handleSubmit}
          style={{ marginTop: 16 }}
          layout="vertical"
        >
          <Form.Item name="id" style={{ display: "none" }}>
            <Input />
          </Form.Item>

          <Form.Item
            name="name"
            label="Tên mã giảm giá"
            rules={[{ required: true, message: "Vui lòng nhập tên" }]}
          >
            <Input placeholder="Nhập tên mã giảm giá" />
          </Form.Item>

          <Form.Item
            name="percent"
            label="Phần trăm giảm giá"
            rules={[{ required: true, message: "Vui lòng nhập phần trăm" }]}
          >
            <InputNumber
              min={0}
              max={100}
              placeholder="Nhập phần trăm giảm giá"
              style={{ width: "100%" }}
              step={0.01}
              precision={2}
              formatter={(value) => `${value}%`}
              parser={(value) => value.replace('%', '')}
            />
          </Form.Item>

          <Form.Item
            name="range"
            label="Thời gian áp dụng"
            rules={[
              { required: true, message: "Vui lòng chọn khoảng thời gian!" },
            ]}
          >
            <RangePicker
              format="YYYY-MM-DD"
              style={{ width: "100%" }}
              placeholder={["Từ ngày", "Đến ngày"]}
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" style={{ width: "100%" }} htmlType="submit">
              {editingDiscount ? "Cập nhật" : "Thêm mới"}
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
