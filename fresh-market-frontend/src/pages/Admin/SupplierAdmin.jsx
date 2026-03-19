import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  App,
  Modal,
  Space,
  Table,
  Tooltip,
} from "antd";
import MyButton from "../../components/MyButton";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';
import './AccountAdmin.css';
import {
  createSupplier,
  deleteSupplier,
  updateSupplier,
  searchSuppliers,
  getSupplierByCode
} from "../../api/supplier";
import CategoryForm from "../../components/CategoryForm";
import CustomPagination from "../../components/CustomPagination/CustomPagination";

export default function SupplierAdmin() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState(null);
  const [supplierData, setSupplierData] = useState({
    data: [],
    totalElements: 0,
    totalPage: 0,
    pageSize: 10,
    currentPage: 1
  });
  const [loading, setLoading] = useState(false);
  const { modal, message } = App.useApp();
  const [selectedIds, setSelectedIds] = useState([]);

  const fetchSuppliers = async (page = supplierData.currentPage, size = supplierData.pageSize) => {
    setLoading(true);
    try {
      const result = await searchSuppliers(page, size);
      if (result) {
        setSupplierData({
          data: result.data || [],
          totalElements: result.totalElements || 0,
          totalPage: result.totalPage || 0,
          pageSize: size,
          currentPage: page
        });
      }
    } catch (error) {
      console.error("Fetch suppliers failed:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Hàm mở modal
  const showModal = () => {
    setIsModalVisible(true);
  };

  // Hàm đóng modal
  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingSupplier(null);
  };

  const showUpdateModal = async (supplier) => {
    setLoading(true);
    try {
      const fullSupplier = await getSupplierByCode(supplier.code);
      if (fullSupplier) {
        setEditingSupplier(fullSupplier);
        setIsModalVisible(true);
      }
    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết nhà cung cấp");
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (data) => {
    await createSupplier(data);
    fetchSuppliers();
    setIsModalVisible(false);
  };

  const handleUpdate = async (data) => {
    await updateSupplier(editingSupplier.code, data);
    fetchSuppliers();
    setIsModalVisible(false);
  };

  const handleDelete = async (supplier) => {
    try {
      await deleteSupplier(supplier.code);
      message.success("Xóa nhà cung cấp thành công");
      fetchSuppliers();
    } catch (error) {
      message.error("Xóa nhà cung cấp thất bại!");
    }
  };

  const deleteSelectedSuppliers = () => {
    modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${selectedIds.length} nhà cung cấp đã chọn? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          const deletePromises = selectedIds.map(code => deleteSupplier(code));
          await Promise.all(deletePromises);
          
          message.success(`Đã xóa ${selectedIds.length} nhà cung cấp`);
          setSelectedIds([]);
          fetchSuppliers();
        } catch (error) {
          message.error("Có lỗi xảy ra khi xóa nhà cung cấp!");
          console.error("Bulk delete failed:", error);
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const showDeleteConfirm = (supplier) => {
    modal.confirm({
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
      render: (_, __, index) => (supplierData.currentPage - 1) * supplierData.pageSize + index + 1,
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
      width: 150,
      align: "center",
      render: (supplier) => (
        <Space size="small">
          <Tooltip title="Cập nhật">
            <MyButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => showUpdateModal(supplier)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <MyButton
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(supplier)}
            />
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
          <div className="stats" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>Tổng số: <span className="count">{supplierData.totalElements}</span> nhà cung cấp</div>
            {selectedIds.length > 0 && (
                <MyButton className='btn-remove'
                  danger 
                  type="primary" 
                  onClick={deleteSelectedSuppliers}
                  icon={<DeleteOutlined />}
                >
                  Xóa {selectedIds.length} nhà cung cấp
                </MyButton>
              )}
          </div>
          <MyButton className="btn-add" onClick={showModal}>
            <FaPlus /> Thêm mới
          </MyButton>
        </div>

        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys),
            }}
            dataSource={supplierData.data}
            columns={columns}
            rowKey="code"
            pagination={false}
            bordered
            size="middle"
            loading={loading}
          />

          <CustomPagination
            current={supplierData.currentPage}
            pageSize={supplierData.pageSize}
            total={supplierData.totalElements}
            onChange={(page) => fetchSuppliers(page, supplierData.pageSize)}
            onPageSizeChange={(size) => fetchSuppliers(1, size)}
            layout="right"
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
        width={editingSupplier ? 400 : 600}
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
