import { DeleteOutlined, EditOutlined, PlusOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Breadcrumb,
  Button,
  Divider,
  Modal,
  Space,
  Table,
  Tooltip,
  Typography,
} from "antd";
import { useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';
import './AccountAdmin.css';
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
} from "../../api/supplier";
import CategoryForm from "../../components/CategoryForm";
import { useSuppliers } from "../../context/SupplierContext";

const { Text } = Typography;

export default function SupplierAdmin() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const supplierContext = useSuppliers();
  const suppliers = supplierContext?.suppliers || [];
  const refreshSuppliers = supplierContext?.refreshSuppliers;

  // Hàm mở modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Hàm đóng modal
  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingSupplier(null);
  };

  const showUpdateModal = (supplier) => {
    setEditingSupplier(supplier);
    setIsModalVisible(true);
  };

  const handleCreate = async (data) => {
    await createSupplier(data);
    if (refreshSuppliers) await refreshSuppliers();
    setIsModalVisible(false);
  };

  const handleUpdate = async (data) => {
    await updateSupplier(editingSupplier.code, data);
    if (refreshSuppliers) await refreshSuppliers();
    setIsModalVisible(false);
  };

  const handleDelete = async (supplier) => {
    await deleteSupplier(supplier.code);
    if (refreshSuppliers) await refreshSuppliers();
  };

  const showDeleteConfirm = (supplier) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: 'Bạn có chắc chắn muốn xóa nhà cung cấp này? Hành động này không thể hoàn tác.',
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        await handleDelete(supplier);
      },
    });
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 100,
      align: 'center',
      render: (_, __, index) => index + 1,
    },
    {
      title: "Mã nhà cung cấp",
      dataIndex: "code",
      key: "code",
      align: 'center',
      render: (code) => <span className="font-medium">{code}</span>,
    },
    {
      title: "Tên nhà cung cấp",
      dataIndex: "name",
      key: "name",
      align: 'center',
      render: (name) => <span className="font-medium">{name}</span>,
    },
    {
      title: "Hành động",
      key: "action",
      width: 200,
      align: "center",
      render: (supplier) => (
        <Space size="small">
          <Tooltip title="Cập nhật">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showUpdateModal(supplier)}
            >

            </Button>
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(supplier)}
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
        <h1 className="page-title">Quản lý nhà cung cấp</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> / <Link to="/admin/suppliers">Quản lý nhà cung cấp</Link> / <span className="active">Danh sách nhà cung cấp</span>
        </div>
      </div>

      <div className="admin-card">
        <div className="table-actions-row">
          <div className="stats">
            Tổng số: <span className="count">{suppliers?.length || 0}</span> nhà cung cấp
          </div>
          <button className="btn-add" onClick={showModal}>
            <FaPlus /> Thêm mới
          </button>
        </div>

        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table
            dataSource={suppliers}
            columns={columns}
            rowKey="code"
            pagination={false}
            bordered
            size="middle"
          />
        </div>
      </div>

      <Modal
        title={
          <span>
            {editingSupplier
              ? "Cập nhật nhà cung cấp"
              : "Thêm mới nhà cung cấp"}
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
        <CategoryForm
          onSubmit={editingSupplier ? handleUpdate : handleCreate}
          submitButtonText={editingSupplier ? "Cập nhật" : "Thêm mới"}
          initValues={editingSupplier}
          isUpdate={editingSupplier}
          isCategory={false}
        />
      </Modal>
    </div>
  );
}
