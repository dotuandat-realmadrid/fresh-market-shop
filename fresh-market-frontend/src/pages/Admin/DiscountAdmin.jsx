import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  App,
  DatePicker,
  Form,
  Input,
  InputNumber,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import MyButton from "../../components/MyButton";
import dayjs from "dayjs";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';
import './AccountAdmin.css';
import {
  deleteDiscount,
  searchDiscounts,
  updateDiscount,
  getDiscountById,
} from "../../api/discount";
import CustomPagination from "../../components/CustomPagination/CustomPagination";

const { RangePicker } = DatePicker;
const { Text } = Typography;

export default function DiscountAdmin() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState(null);
  const [discountData, setDiscountData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    pageSize: 10,
    currentPage: 1
  });
  const [loading, setLoading] = useState(true);
  const [form] = Form.useForm();
  const { modal, message } = App.useApp();
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchDiscounts = async (page = discountData.currentPage, size = discountData.pageSize) => {
    setLoading(true);
    try {
      const result = await searchDiscounts(page, size);
      if (result) {
        setDiscountData({
          data: result.data || [],
          totalElements: result.totalElements || 0,
          totalPage: result.totalPage || 0,
          pageSize: size,
          currentPage: page
        });
      }
    } catch (error) {
      console.error("Fetch discounts failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDiscounts();
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
  const showUpdateModal = async (discount) => {
    setLoading(true);
    try {
      const fullDiscount = await getDiscountById(discount.id);
      if (fullDiscount) {
        setEditingDiscount(fullDiscount);
        setIsModalVisible(true);
        setTimeout(() => {
          form.setFieldsValue({
            ...fullDiscount,
            range:
              fullDiscount.startDate && fullDiscount.endDate
                ? [dayjs(fullDiscount.startDate), dayjs(fullDiscount.endDate)]
                : [],
          });
        }, 0);
      }
    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết mã giảm giá");
    } finally {
      setLoading(false);
    }
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

    fetchDiscounts();
    setIsModalVisible(false);
    form.resetFields();
  };

  const handleDelete = async (discount) => {
    try {
      await deleteDiscount(discount.id);
      message.success("Xóa mã giảm giá thành công");
      fetchDiscounts();
    } catch (error) {
      message.error("Xóa mã giảm giá thất bại!");
    }
  };

  const deleteSelectedDiscounts = () => {
    modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${selectedIds.length} mã giảm giá đã chọn? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          const deletePromises = selectedIds.map(id => deleteDiscount(id));
          await Promise.all(deletePromises);
          
          message.success(`Đã xóa ${selectedIds.length} mã giảm giá`);
          setSelectedIds([]);
          fetchDiscounts();
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa mã giảm giá!");
          console.error("Bulk delete failed:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const showDeleteConfirm = (discount) => {
    modal.confirm({
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
      render: (_, __, index) => (discountData.currentPage - 1) * discountData.pageSize + index + 1,
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
            <MyButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => showUpdateModal(discount)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <MyButton
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(discount)}
            />
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
          <div className="stats" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>Tổng số: <span className="count">{discountData.totalElements}</span> mã giảm giá</div>
            {selectedIds.length > 0 && (
              <MyButton className='btn-remove'
                danger 
                type="primary" 
                onClick={deleteSelectedDiscounts}
                icon={<DeleteOutlined />}
              >
                Xóa {selectedIds.length} mã giảm giá
              </MyButton>
            )}
          </div>
          <MyButton className="btn-add" onClick={showCreateModal}>
            <FaPlus /> Thêm mới
          </MyButton>
        </div>

        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys),
            }}
            dataSource={discountData.data}
            columns={columns}
            rowKey="id"
            pagination={false}
            bordered
            size="middle"
            loading={loading}
          />

          <CustomPagination
            current={discountData.currentPage}
            pageSize={discountData.pageSize}
            total={discountData.totalElements}
            onChange={(page) => fetchDiscounts(page, discountData.pageSize)}
            onPageSizeChange={(size) => fetchDiscounts(1, size)}
            layout="right"
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
            <MyButton type="primary" style={{ width: "100%" }} htmlType="submit">
              {editingDiscount ? "Cập nhật" : "Thêm mới"}
            </MyButton>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
