import { 
  DeleteOutlined, 
  EditOutlined, 
  ExclamationCircleOutlined,
  PlusOutlined,
  SearchOutlined
} from "@ant-design/icons";
import {
  Modal,
  Space,
  Table,
  Tooltip,
  App,
  Select,
  Input,
} from "antd";
import MyButton from "../../components/MyButton";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FaFilter, 
  FaChevronDown, 
  FaTrashAlt, 
  FaIdCard,
  FaTag
} from 'react-icons/fa';
import './AccountAdmin.css';
import {
  createCategory,
  deleteCategory,
  updateCategory,
  uploadCategoryImage,
  updateCategoryImage,
  getCategoryTree,
  getCategoryTreePaged,
  getCategoryByCode
} from "../../api/category";
import CategoryForm from "../../components/CategoryForm";
import { useCategories } from "../../context/CategoryContext.jsx";
import { IMAGE_URL } from "../../api/auth";
import CustomPagination from '../../components/CustomPagination/CustomPagination';

/**
 * Làm phẳng cây category, gắn số thứ tự dạng 1, 1.1, 1.1.1 ...
 * @param {Array} nodes - danh sách node gốc
 * @param {string} prefix - tiền tố số thứ tự cha ("" với root)
 * @returns {Array} mảng phẳng với thuộc tính stt
 */
function flattenTree(nodes, prefix = "", parentNode = null) {
  const result = [];
  nodes.forEach((node, idx) => {
    const stt = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
    // Gắn thông tin cha vào node để Modal Update có thể hiển thị danh mục cha đã có
    const nodeWithParent = { 
      ...node, 
      stt, 
      children: undefined, 
      parents: parentNode ? [parentNode] : [] 
    };
    result.push(nodeWithParent);
    
    if (node.children && node.children.length > 0) {
      result.push(...flattenTree(node.children, stt, node));
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
  const [showFilter, setShowFilter] = useState(false);
  const [isLevelOpen, setIsLevelOpen] = useState(false);
  const [selectedLevelLabel, setSelectedLevelLabel] = useState("Tất cả cấp độ");
  
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 5,
    total: 0
  });
  const [filters, setFilters] = useState({
    code: "",
    name: "",
    level: 1
  });

  const { modal, message } = App.useApp();
  const categoryContext = useCategories();
  const refreshCategoriesContext = categoryContext?.refreshCategories;

  const [selectedIds, setSelectedIds] = useState([]);

  const fetchCategories = async (page = pagination.current, pageSize = pagination.pageSize, currentFilters = filters) => {
    setLoading(true);
    try {
      const response = await getCategoryTreePaged(page, pageSize, currentFilters.code, currentFilters.name, currentFilters.level);
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

  const deleteSelectedCategories = () => {
    modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${selectedIds.length} danh mục đã chọn? Hành động này không thể hoàn tác.`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        setLoading(true);
        try {
          // Change to individual deletes if backend doesn't support bulk joined string
          const deletePromises = selectedIds.map(code => deleteCategory(code));
          await Promise.all(deletePromises);
          
          message.success(`Đã xóa ${selectedIds.length} danh mục`);
          setSelectedIds([]);
          if (refreshCategoriesContext) await refreshCategoriesContext();
          fetchCategories();
        } catch (error) {
          message.error(error.message || "Xóa danh mục thất bại!");
        } finally {
          setLoading(false);
        }
      },
    });
  };

  const handleTableChange = (newPagination) => {
    fetchCategories(newPagination.current, newPagination.pageSize);
  };

  const handleSearch = () => {
    fetchCategories(1, pagination.pageSize);
  };

  const handleReset = () => {
    const defaultFilters = { code: "", name: "", level: 1 };
    setFilters(defaultFilters);
    setSelectedLevelLabel("Tất cả cấp độ");
    fetchCategories(1, pagination.pageSize, defaultFilters);
  };


  useEffect(() => {
    fetchCategories();
  }, []);

  const showAddModal = () => {
    setIsModalVisible(true);
  };

  const handleCancelModal = () => {
    setIsModalVisible(false);
    setEditingCategory(null);
    setPendingImageFile(null);
  };

  const showUpdateModal = async (category) => {
    try {
      setLoading(true);
      const fullCategory = await getCategoryByCode(category.code);
      if (fullCategory) {
        setEditingCategory(fullCategory);
        setPendingImageFile(null);
        setIsModalVisible(true);
      }
    } catch (error) {
      message.error("Không thể lấy thông tin chi tiết danh mục");
    } finally {
      setLoading(false);
    }
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
      width: 80,
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
      width: 70,
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
            <MyButton
              type="link"
              icon={<EditOutlined />}
              onClick={() => showUpdateModal(record)}
            />
          </Tooltip>
          <Tooltip title="Xóa">
            <MyButton
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
      <div className="pagetitle mb-4">
        <h1>Danh sách danh mục</h1>
        <nav>
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/admin/categories">Quản lý danh mục</Link></li>
            <li className="breadcrumb-item active">Danh sách danh mục</li>
          </ol>
        </nav>
      </div>

      <div className="admin-card">
        {/* Filter Section Header */}
        <div 
          className={`filter-header ${showFilter ? 'active' : ''}`} 
          onClick={() => setShowFilter(!showFilter)}
        >
          <div className="filter-title">
            <FaFilter className="icon" /> Bộ lọc tìm kiếm
          </div>
          <FaChevronDown className={`arrow-icon ${showFilter ? 'up' : ''}`} />
        </div>

        {/* Filter Content */}
        {showFilter && (
          <div className="filter-content">
            <div className="filter-grid">
              <div className="form-group">
                <label>Mã danh mục</label>
                <div className="input-wrapper">
                  <FaIdCard className="field-icon" />
                  <input 
                    type="text" 
                    placeholder="Nhập mã code" 
                    value={filters.code}
                    onChange={(e) => setFilters({...filters, code: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Tên danh mục</label>
                <div className="input-wrapper">
                  <FaTag className="field-icon" />
                  <input 
                    type="text" 
                    placeholder="Nhập tên danh mục" 
                    value={filters.name}
                    onChange={(e) => setFilters({...filters, name: e.target.value})}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Cấp độ</label>
                <div 
                  className={`custom-dropdown-wrapper ${isLevelOpen ? 'active' : ''}`}
                  onClick={() => setIsLevelOpen(!isLevelOpen)}
                  onBlur={() => setTimeout(() => setIsLevelOpen(false), 200)}
                  tabIndex="0"
                >
                  <div className="dropdown-selected">
                    {selectedLevelLabel}
                    <FaChevronDown className={`select-arrow ${isLevelOpen ? 'open' : ''}`} />
                  </div>
                  {isLevelOpen && (
                    <ul className="dropdown-list">
                      <li key="all-levels" onClick={() => { setSelectedLevelLabel("Tất cả cấp độ"); setFilters({...filters, level: null}); }}>Tất cả cấp độ</li>
                      <li key="level-1" onClick={() => { setSelectedLevelLabel("Cấp 1"); setFilters({...filters, level: 1}); }}>Cấp 1</li>
                      <li key="level-2" onClick={() => { setSelectedLevelLabel("Cấp 2"); setFilters({...filters, level: 2}); }}>Cấp 2</li>
                      <li key="level-3" onClick={() => { setSelectedLevelLabel("Cấp 3"); setFilters({...filters, level: 3}); }}>Cấp 3</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
            <div className="filter-actions">
              <MyButton onClick={handleReset} icon={<DeleteOutlined />}>
                Xóa bộ lọc
              </MyButton>
              <MyButton type="primary" onClick={handleSearch} icon={<SearchOutlined />}>
                Tìm kiếm
              </MyButton>
            </div>
          </div>
        )}

        <div className="table-actions-row">
          <div className="stats" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>Tổng số: <span className="count">{pagination.total}</span> danh mục</div>
            {selectedIds.length > 0 && (
              <MyButton
                danger
                type="primary"
                onClick={deleteSelectedCategories}
                icon={<FaTrashAlt />}
              >
                Xóa {selectedIds.length} danh mục
              </MyButton>
            )}
          </div>
          <MyButton type="primary" icon={<PlusOutlined />} onClick={showAddModal}>
            Thêm mới
          </MyButton>
        </div>

        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys),
            }}
            dataSource={flatCategories}
            columns={columns}
            rowKey="stt"
            loading={loading}
            pagination={false}
            bordered
            size="middle"
            rowClassName={(record) =>
              record.level === 1 ? 'row-level-1' : record.level === 2 ? 'row-level-2' : 'row-level-3'
            }
          />

          <CustomPagination
            current={pagination.current}
            pageSize={pagination.pageSize}
            total={pagination.total}
            onChange={(page) => fetchCategories(page, pagination.pageSize)}
            onPageSizeChange={(size) => {
              fetchCategories(1, size);
            }}
            layout="right"
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
