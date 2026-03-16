import { DeleteOutlined, EditOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import {
  Button,
  Modal,
  Space,
  Table,
  Tooltip,
  App,
} from "antd";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { FaPlus } from 'react-icons/fa';
import './AccountAdmin.css';
import {
  createCategory,
  deleteCategory,
  updateCategory,
  uploadCategoryImage,
  updateCategoryImage,
  getCategoryTree,
  getCategoryTreePaged
} from "../../api/category";
import CategoryForm from "../../components/CategoryForm";
import { useCategories } from "../../context/CategoryContext.jsx";
import { IMAGE_URL } from "../../api/auth";

/**
 * Làm phẳng cây category, gắn số thứ tự dạng 1, 1.1, 1.1.1 ...
 * @param {Array} nodes - danh sách node gốc
 * @param {string} prefix - tiền tố số thứ tự cha ("" với root)
 * @returns {Array} mảng phẳng với thuộc tính stt
 */
function flattenTree(nodes, prefix = "") {
  const result = [];
  nodes.forEach((node, idx) => {
    const stt = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
    result.push({ ...node, stt, children: undefined });
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, stt));
    }
  });
  return result;
}

export default function CategoryAdmin() {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [flatCategories, setFlatCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pendingImageFile, setPendingImageFile] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0
  });

  const { modal, message } = App.useApp();
  const categoryContext = useCategories();
  const refreshCategoriesContext = categoryContext?.refreshCategories;

  const fetchCategories = async (page = pagination.current, pageSize = pagination.pageSize) => {
    setLoading(true);
    try {
      const response = await getCategoryTreePaged(page, pageSize, "", "");
      if (response && response.data) {
        setFlatCategories(flattenTree(response.data));
        setPagination({
          current: response.currentPage,
          pageSize: response.pageSize,
          total: response.totalElements
        });
      } else {
        setFlatCategories([]);
      }
    } catch (error) {
      message.error(error.message || "Tải danh mục thất bại!");
      setFlatCategories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleTableChange = (newPagination) => {
    fetchCategories(newPagination.current, newPagination.pageSize);
  };


  useEffect(() => {
    fetchCategories();
  }, []);

  const showModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    setPendingImageFile(null);
  };

  const showUpdateModal = (category) => {
    setEditingCategory(category);
    setPendingImageFile(null);
    setIsModalVisible(true);
  };

  const handleCreate = async (data) => {
    try {
      const result = await createCategory(data);
      if (result) {
        if (pendingImageFile) {
          await uploadCategoryImage(result.code, pendingImageFile);
        }
        message.success("Thêm mới danh mục thành công");
        setPendingImageFile(null);
        if (refreshCategoriesContext) await refreshCategoriesContext();
        fetchCategories();
        setIsModalVisible(false);
      }
    } catch (error) {
      message.error(error.message || "Thêm danh mục thất bại!");
    }
  };

  const handleUpdate = async (data) => {
    try {
      await updateCategory(editingCategory.code, data);
      if (pendingImageFile) {
        await updateCategoryImage(editingCategory.code, pendingImageFile, null);
      }
      message.success("Cập nhật danh mục thành công");
      setPendingImageFile(null);
      if (refreshCategoriesContext) await refreshCategoriesContext();
      fetchCategories();
      setIsModalVisible(false);
    } catch (error) {
      message.error(error.message || "Cập nhật danh mục thất bại!");
    }
  };

  const handleDelete = async (category) => {
    try {
      await deleteCategory(category.code);
      message.success("Xóa danh mục thành công");
      if (refreshCategoriesContext) await refreshCategoriesContext();
      fetchCategories();
    } catch (error) {
      message.error(error.message || "Xóa danh mục thất bại!");
    }
  };

  const showDeleteConfirm = (category) => {
    modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa danh mục "${category.name}"? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        await handleDelete(category);
      },
    });
  };

  const columns = [
    {
      title: "STT",
      key: "stt",
      width: 70,
      align: 'center',
      render: (_, record) => (
        <span style={{
          fontWeight: 600,
        }}>
          {record.stt}
        </span>
      ),
    },
    {
      title: "Mã danh mục",
      dataIndex: "code",
      key: "code",
      render: (code, record) => (
        <span style={{
          fontWeight: 600,
        }}>
          {code}
        </span>
      ),
    },
    {
      title: "Tên danh mục",
      dataIndex: "name",
      key: "name",
      render: (name, record) => (
        <span style={{
          fontWeight: 600,
        }}>
          {record.level === 2 && <span style={{ color: '#bfbfbf' }}></span>}
          {record.level === 3 && <span style={{ color: '#bfbfbf' }}>　</span>}
          {name}
        </span>
      ),
    },
    {
      title: "Mô tả",
      dataIndex: "description",
      key: "description",
      render: (description, record) => (
        <span style={{
          fontWeight: 600,
        }}>
          {description}
        </span>
      ),
    },
    {
      title: "Cấp độ",
      dataIndex: "level",
      key: "level",
      align: 'center',
      // width: 80,
      render: (level) => (
        <span style={{
          background: level === 1 ? '#e6f4ff' : level === 2 ? '#f6ffed' : '#fff7e6',
          color: level === 1 ? '#1677ff' : level === 2 ? '#52c41a' : '#fa8c16',
          padding: '2px 8px',
          borderRadius: 4,
          fontSize: 12,
          fontWeight: 600,
        }}>
          Cấp {level}
        </span>
      ),
    },
    {
      title: "Ảnh",
      dataIndex: "imagePath",
      key: "imagePath",
      align: "center",
      // width: 70,
      render: (imagePath) => imagePath
        ? <img src={`${IMAGE_URL}/${imagePath}`} alt="category" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 6 }} />
        : <span style={{ color: '#bfbfbf', fontSize: 12 }}>N/A</span>
    },
    {
      title: "Hành động",
      key: "action",
      width: 120,
      align: "center",
      render: (_, record) => (
        <Space size="small">
          <Tooltip title="Cập nhật">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => showUpdateModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <Button
              type="link"
              danger
              icon={<DeleteOutlined />}
              onClick={() => showDeleteConfirm(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div className="account-admin-container">
      <div className="page-header">
        <h1 className="page-title">Quản lý danh mục</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> / <Link to="/admin/categories">Quản lý danh mục</Link> / <span className="active">Danh sách</span>
        </div>
      </div>

      <div className="admin-card">

        <div className="table-actions-row">
          <div className="stats">
            Tổng số: <span className="count">{pagination.total}</span> danh mục gốc
          </div>
          <button className="btn-add" onClick={showModal}>
            <FaPlus /> Thêm mới
          </button>
        </div>

        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table
            dataSource={flatCategories}
            columns={columns}
            rowKey={(record) => `${record.code}-${record.stt}`}
            loading={loading}
            pagination={false}
            onChange={handleTableChange}
            bordered
            size="middle"
            rowClassName={(record) =>
              record.level === 1 ? 'row-level-1' : record.level === 2 ? 'row-level-2' : 'row-level-3'
            }
          />
        </div>
      </div>

      <Modal
        title={
          <span>
            {editingCategory
              ? "Cập nhật danh mục"
              : "Thêm mới danh mục"}
          </span>
        }
        open={isModalVisible}
        onCancel={handleCancelModal}
        footer={null}
        destroyOnHidden={true}
        width={800}
        mask={{ closable: false }}
        centered
      >
        <CategoryForm
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          submitButtonText={editingCategory ? "Cập nhật" : "Thêm mới"}
          initValues={editingCategory}
          isUpdate={editingCategory}
          isCategory={true}
          onImageChange={(file) => setPendingImageFile(file)}
        />
      </Modal>
    </div>
  );
}
