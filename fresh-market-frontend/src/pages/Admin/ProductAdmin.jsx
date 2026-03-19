import React, { useState, useEffect, useRef } from 'react';
import { 
  App, Table, Input, Select, Radio, Checkbox, 
  Space, Typography, Tag, Tooltip, Dropdown, Modal, 
  Row, Col, Form, InputNumber, Badge, Avatar
} from 'antd';
import { 
  FaFilter, FaChevronDown, FaIdCard, FaBarcode, FaBox, 
  FaPlus, FaFileExcel, FaQrcode, FaFilePdf, FaRobot,
  FaFileExport, FaFileImport, FaEraser, FaSearch,
  FaTrashAlt, FaEye, FaUpload, FaImage, FaTimes,
  FaCloudUploadAlt, FaLink, FaTrash
} from 'react-icons/fa';
import { 
  ExclamationCircleOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './AccountAdmin.css';
import './ProductAdmin.css';
import CustomPagination from '../../components/CustomPagination/CustomPagination';
import { getAll as getAllCategories } from '../../api/category';
import { getAll as getAllSuppliers } from '../../api/supplier';
import { 
  searchProducts, createProduct, updateProduct, deleteProducts, 
  uploadProductImages, exportProductsExcel, exportProductsPDF
} from '../../api/product';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';
import ProductImport from '../../components/ProductImport';
import MyButton from '../../components/MyButton';

const { Text, Title } = Typography;
const { Option } = Select;

const ProductAdmin = () => {
  const { message, modal } = App.useApp();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Data states
  const [products, setProducts] = useState([]);
  const [totalElements, setTotalElements] = useState(0);
  const [categories, setCategories] = useState([]);
  const [suppliers, setSuppliers] = useState([]);

  // Filter state
  const [filters, setFilters] = useState({
    id: '',
    code: '',
    name: '',
    minPrice: '',
    maxPrice: '',
    categoryCode: '',
    supplierCode: '',
    sortBy: 'createdDate',
    direction: 'DESC'
  });

  // Modal states
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);
  const [isImportExcelVisible, setIsImportExcelVisible] = useState(false);
  const [isImportQRVisible, setIsImportQRVisible] = useState(false);
  const [isImportPDFVisible, setIsImportPDFVisible] = useState(false);
  const [isImportAIVisible, setIsImportAIVisible] = useState(false);
  const [isImportDropdownOpen, setIsImportDropdownOpen] = useState(false);
  const [isExportDropdownOpen, setIsExportDropdownOpen] = useState(false);
  
  const [form] = Form.useForm();
  const [pendingImages, setPendingImages] = useState([]);

  // Fetch initial data
  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [catData, supData] = await Promise.all([
          getAllCategories(),
          getAllSuppliers()
        ]);
        setCategories(catData || []);
        setSuppliers(supData || []);
      } catch (error) {
        message.error("Lỗi khi tải danh mục hoặc nhà cung cấp");
      }
    };
    fetchMetadata();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const response = await searchProducts(filters, currentPage, pageSize);
      if (response) {
        setProducts(response.data || []);
        setTotalElements(response.totalElements || 0);
      }
    } catch (error) {
      message.error(error.message || "Lỗi khi tải danh sách sản phẩm");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [currentPage, pageSize, filters]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchProducts();
  };

  const handleResetFilters = () => {
    setFilters({
      id: '',
      code: '',
      name: '',
      minPrice: '',
      maxPrice: '',
      categoryCode: '',
      supplierCode: '',
      sortBy: 'createdDate',
      direction: 'DESC'
    });
    setCurrentPage(1);
  };

  const handleDeleteSelected = () => {
    modal.confirm({
      title: 'Xác nhận xóa',
      icon: <ExclamationCircleOutlined />,
      content: `Bạn có chắc chắn muốn xóa ${selectedIds.length} sản phẩm đã chọn?`,
      okText: 'Xóa',
      okType: 'danger',
      cancelText: 'Hủy',
      onOk: async () => {
        try {
          await deleteProducts(selectedIds);
          message.success("Xóa sản phẩm thành công");
          setSelectedIds([]);
          fetchProducts();
        } catch (error) {
          message.error(error.message || "Xóa sản phẩm thất bại");
        }
      },
    });
  };

  // Image handlers
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const validImages = files.filter(file => file.type.startsWith('image/'));
    setPendingImages(prev => [...prev, ...validImages]);
  };

  const removePendingImage = (index) => {
    setPendingImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateProduct = async (values) => {
    setLoading(true);
    try {
      const result = await createProduct(values);
      if (result && pendingImages.length > 0) {
        await uploadProductImages(result.id, pendingImages);
      }
      message.success("Thêm sản phẩm thành công");
      setIsAddModalVisible(false);
      form.resetFields();
      setPendingImages([]);
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Thêm sản phẩm thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleExportExcel = async () => {
    setLoading(true);
    try {
      await exportProductsExcel();
      message.success("Xuất file Excel thành công");
      setIsExportDropdownOpen(false);
    } catch (error) {
      message.error(error.message || "Xuất file Excel thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    setLoading(true);
    try {
      await exportProductsPDF();
      message.success("Xuất file PDF thành công");
      setIsExportDropdownOpen(false);
    } catch (error) {
      message.error(error.message || "Xuất file PDF thất bại");
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 60,
      align: 'center',
      render: (_, __, index) => <span className="stt-text">{(currentPage - 1) * pageSize + index + 1}</span>,
    },
    {
      title: 'Thông tin sản phẩm',
      key: 'productInfo',
      render: (_, record) => (
        <div className="product-info-wrapper">
          <img 
            src={record.images && record.images.length > 0 ? `${IMAGE_URL}/${record.images[0]}` : `${DEFAULT_IMAGE}`} 
            alt={record.name}
            className="product-img"
          />
          <div className="product-details">
            {record.name}
            <br />
            <span className="product-code">{record.code}</span>
            {record.discountName && (
              <>
                <br />
                <Tag className="discount-tag">{record.discountName}</Tag>
              </>
            )}
          </div>
        </div>
      ),
    },
    {
      title: 'Danh mục & Hãng',
      key: 'categorySupplier',
      width: 150,
      render: (_, record) => (
        <div className="tag-stack">
          <Tag color="blue" className="pill-tag">{record.categoryCode || 'N/A'}</Tag>
          <Tag color="green" className="pill-tag">{record.supplierCode || 'N/A'}</Tag>
        </div>
      ),
    },
    {
      title: 'Giá',
      key: 'price',
      width: 110,
      align: 'center',
      render: (_, record) => (
        <div className="price-stack">
          {record.discountPrice > 0 ? (
            <>
              <div className="original-price">{record.price?.toLocaleString()}đ</div>
              <div className="discount-price">{record.discountPrice?.toLocaleString()}đ</div>
            </>
          ) : (
            <div className="current-price">{record.price?.toLocaleString()}đ</div>
          )}
        </div>
      ),
    },
    {
      title: 'Đã bán',
      dataIndex: 'soldQuantity',
      key: 'sold',
      width: 80,
      align: 'center',
    },
    {
      title: 'Tồn kho',
      dataIndex: 'inventoryQuantity',
      key: 'inventory',
      width: 80,
      align: 'center',
    },
    {
      title: 'Đánh giá',
      key: 'rating',
      width: 120,
      align: 'center',
      render: (_, record) => (
        <div className="rating-stack">
          <div className="stars-row">★★★★★</div>
          <div className="review-text">({record.reviewCount || 0} đánh giá)</div>
        </div>
      ),
    },
    {
      title: '',
      key: 'action',
      width: 50,
      align: 'center',
      render: (_, record) => (
        <Tooltip title="Xem chi tiết">
          <MyButton type="link" icon={<FaEye />} href={`/admin/products/${record.code}`} />
        </Tooltip>
      ),
    },
  ];

  const importMenu = (
    <div className="import-export-dropdown">
        <div className="import-menu-item" onClick={() => { setIsImportExcelVisible(true); setIsImportDropdownOpen(false); }}><FaFileExcel style={{ color: '#107c41' }} /> Import Excel</div>
        <div className="import-menu-item" onClick={() => { setIsImportPDFVisible(true); setIsImportDropdownOpen(false); }}><FaFilePdf style={{ color: '#ff4d4f' }} /> Import PDF</div>
        <div className="import-menu-item" onClick={() => { setIsImportQRVisible(true); setIsImportDropdownOpen(false); }}><FaQrcode /> Import QR</div>
        <div className="import-menu-item" onClick={() => { setIsImportAIVisible(true); setIsImportDropdownOpen(false); }}><FaRobot style={{ color: '#722ed1' }} /> Import AI</div>
    </div>
  );

  const exportMenu = (
    <div className="import-export-dropdown">
        <div className="import-menu-item" onClick={handleExportExcel}><FaFileExcel style={{marginRight: 8, color: '#107c41'}} /> Export Excel</div>
        <div className="import-menu-item" onClick={handleExportPDF}><FaFilePdf style={{marginRight: 8, color: '#e44134'}} /> Export PDF</div>
    </div>
  );

  return (
    <div className="account-admin-container product-admin-container">
      <div className="page-header">
        <h1 className="page-title">Danh sách sản phẩm</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Dashboard</Link> / <span>Quản lý sản phẩm</span> / <span className="active">Danh sách sản phẩm</span>
        </div>
      </div>

      <div className="admin-card">
        {/* Filter Section */}
        <div 
          className={`filter-header ${showFilter ? 'active' : ''}`}
          onClick={() => setShowFilter(!showFilter)}
        >
          <div className="filter-title">
            <FaFilter /> Bộ lọc tìm kiếm
          </div>
          <FaChevronDown className={`arrow-icon ${showFilter ? 'up' : ''}`} />
        </div>

        {showFilter && (
          <div className="filter-content" style={{ padding: '25px 30px' }}>
            <div className="filter-grid">
              <div className="form-group">
                <label>ID sản phẩm</label>
                <div className="input-with-prefix">
                  <div className="input-prefix-icon"><FaIdCard /></div>
                  <input 
                    type="text" placeholder="Nhập ID" 
                    value={filters.id}
                    onChange={e => setFilters({...filters, id: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Mã code</label>
                <div className="input-with-prefix">
                  <div className="input-prefix-icon"><FaBarcode /></div>
                  <input 
                    type="text" placeholder="Nhập Code" 
                    value={filters.code}
                    onChange={e => setFilters({...filters, code: e.target.value})}
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Tên sản phẩm</label>
                <div className="input-with-prefix">
                  <div className="input-prefix-icon"><FaBox /></div>
                  <input 
                    type="text" placeholder="Nhập tên sản phẩm" 
                    value={filters.name}
                    onChange={e => setFilters({...filters, name: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label>Khoảng giá</label>
                <div className="price-range-container">
                  <div className="price-field">
                    <input 
                      placeholder="Giá từ" type="number"
                      value={filters.minPrice}
                      onChange={e => setFilters({...filters, minPrice: e.target.value})}
                    />
                    <div className="price-suffix">đ</div>
                  </div>
                  <div className="price-field">
                    <input 
                      placeholder="Giá đến" type="number"
                      value={filters.maxPrice}
                      onChange={e => setFilters({...filters, maxPrice: e.target.value})}
                    />
                    <div className="price-suffix">đ</div>
                  </div>
                </div>
              </div>

              <div className="form-group">
                <label>Danh mục</label>
                <select 
                    value={filters.categoryCode}
                    onChange={e => setFilters({...filters, categoryCode: e.target.value})}
                >
                  <option value="">Tất cả danh mục</option>
                  {categories.map(cat => <option key={cat.code} value={cat.code}>{cat.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Nhà cung cấp</label>
                <select 
                    value={filters.supplierCode}
                    onChange={e => setFilters({...filters, supplierCode: e.target.value})}
                >
                  <option value="">Tất cả nhà cung cấp</option>
                  {suppliers.map(sup => <option key={sup.code} value={sup.code}>{sup.name}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label>Sắp xếp theo</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <select 
                        style={{ flex: 1 }}
                        value={filters.sortBy}
                        onChange={e => setFilters({...filters, sortBy: e.target.value})}
                    >
                      <option value="point">Phổ biến</option>
                      <option value="soldQuantity">Bán chạy</option>
                      <option value="createdDate">Mới nhất</option>
                      <option value="price">Giá</option>
                    </select>
                    <Radio.Group 
                        value={filters.direction}
                        onChange={e => setFilters({...filters, direction: e.target.value})}
                    >
                        <Space direction="vertical" size={0}>
                            <Radio value="DESC" style={{ fontSize: '13px' }}>Giảm dần</Radio>
                            <Radio value="ASC" style={{ fontSize: '13px' }}>Tăng dần</Radio>
                        </Space>
                    </Radio.Group>
                </div>
              </div>
            </div>
            <div className="filter-actions" style={{ marginTop: '10px' }}>
              <MyButton className="btn-secondary" onClick={handleResetFilters} style={{ background: 'white' }}>
                <FaEraser /> Xóa bộ lọc
              </MyButton>
              <MyButton className="btn-primary" onClick={handleSearch}>
                <FaSearch /> Tìm kiếm
              </MyButton>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="table-actions-row">
          <div className="stats" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div>Tổng số: <span className="count">{totalElements}</span> sản phẩm</div>
            {selectedIds.length > 0 && (
              <MyButton className="btn-danger" onClick={handleDeleteSelected}>
                <FaTrashAlt /> Xóa {selectedIds.length} sản phẩm
              </MyButton>
            )}
          </div>
          <div className="action-buttons">

            <MyButton className="btn-primary" onClick={() => setIsAddModalVisible(true)}>
              <FaPlus /> Thêm mới
            </MyButton>
            
            <Dropdown 
                popupRender={() => importMenu} 
                trigger={['click']} 
                placement="bottomRight"
                open={isImportDropdownOpen}
                onOpenChange={setIsImportDropdownOpen}
            >
                <MyButton className="btn-success">
                    <FaFileImport /> Import <FaChevronDown size={10} />
                </MyButton>
            </Dropdown>

            <Dropdown 
                popupRender={() => exportMenu} 
                trigger={['click']} 
                placement="bottomRight"
                open={isExportDropdownOpen}
                onOpenChange={setIsExportDropdownOpen}
            >
                <MyButton className="btn-success">
                    <FaFileExport /> Export <FaChevronDown size={10} />
                </MyButton>
            </Dropdown>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-responsive" style={{ paddingTop: '10px' }}>
          <Table 
            rowSelection={{
              selectedRowKeys: selectedIds,
              onChange: (keys) => setSelectedIds(keys),
            }}
            dataSource={products}
            columns={columns}
            rowKey="id"
            loading={loading}
            pagination={false}
            bordered
            size="middle"
          />

          <CustomPagination 
            current={currentPage}
            pageSize={pageSize}
            total={totalElements}
            onChange={(page) => setCurrentPage(page)}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setCurrentPage(1);
            }}
            layout="full"
          />
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal
        title={<Title level={4} style={{margin: 0}}><FaPlus size={18} style={{marginRight: 10}}/>Thêm mới sản phẩm</Title>}
        open={isAddModalVisible}
        onCancel={() => {
            setIsAddModalVisible(false);
            setPendingImages([]);
            form.resetFields();
        }}
        footer={null}
        width={700}
        style={{ top: 20, marginBottom: 30 }}
      >
        <Form 
            form={form} 
            layout="vertical" 
            onFinish={handleCreateProduct}
            initialValues={{ price: 1000 }}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item label="Danh mục" name="categoryCode" rules={[{ required: true, message: 'Vui lòng chọn danh mục' }]}>
                <Select placeholder="Chọn danh mục">
                   {categories.map(cat => <Option key={cat.code} value={cat.code}>{cat.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Nhà cung cấp" name="supplierCode" rules={[{ required: true, message: 'Vui lòng chọn nhà cung cấp' }]}>
                <Select placeholder="Chọn nhà cung cấp">
                   {suppliers.map(sup => <Option key={sup.code} value={sup.code}>{sup.name}</Option>)}
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={6}>
              <Form.Item label="Mã sản phẩm" name="code" rules={[{ required: true, message: 'Vui lòng nhập mã sản phẩm' }]}>
                <Input prefix={<FaBarcode color="#94a3b8"/>} placeholder="Mã sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item label="Tên sản phẩm" name="name" rules={[{ required: true, message: 'Vui lòng nhập tên sản phẩm' }]}>
                <Input prefix={<FaBox color="#94a3b8"/>} placeholder="Tên sản phẩm" />
              </Form.Item>
            </Col>
            <Col span={6}>
              <Form.Item label="Giá (VNĐ)" name="price" rules={[{ required: true, message: 'Vui lòng nhập giá' }]}>
                <InputNumber
                  style={{ width: '100%' }}
                  formatter={value => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}
                  parser={value => value.replace(/\./g, '')}
                  min={1000}
                  placeholder="Nhập giá sản phẩm"
                />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item label="Mô tả" name="description">
            <Input.TextArea rows={4} placeholder="Nhập mô tả sản phẩm" />
          </Form.Item>

          <div className="mb-3">
            <label className="fw-bold d-block mb-2">Hình ảnh sản phẩm</label>
            <div className="image-upload-area">
                <input 
                    type="file" id="multi-upload" hidden 
                    multiple accept="image/*"
                    onChange={handleImageChange}
                />
                <label htmlFor="multi-upload" className="upload-placeholder">
                    <FaImage size={24} />
                    <span style={{fontSize: 12, marginTop: 4}}>Tải ảnh lên</span>
                </label>
                
                {pendingImages.map((file, idx) => (
                    <div className="preview-item" key={idx}>
                        <img src={URL.createObjectURL(file)} alt="preview" />
                        <MyButton className="remove-img-btn" onClick={() => removePendingImage(idx)}>
                            <FaTimes />
                        </MyButton>
                    </div>
                ))}
            </div>
            <Text type="secondary" style={{fontSize: 12}}>Có thể tải lên nhiều hình ảnh cùng lúc</Text>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 20}}>
            <MyButton size="large" onClick={() => setIsAddModalVisible(false)} style={{marginRight: 10}}>Hủy</MyButton>
            <MyButton type="primary" size="large" htmlType="submit" loading={loading}>Thêm mới</MyButton>
          </div>
        </Form>
      </Modal>

      {/* Import Modals */}
      <ProductImport 
        isExcelVisible={isImportExcelVisible}
        onExcelCancel={() => setIsImportExcelVisible(false)}
        isQRVisible={isImportQRVisible}
        onQRCancel={() => setIsImportQRVisible(false)}
        isPDFVisible={isImportPDFVisible}
        onPDFCancel={() => setIsImportPDFVisible(false)}
        isAIVisible={isImportAIVisible}
        onAICancel={() => setIsImportAIVisible(false)}
        onSuccess={fetchProducts}
      />

      {/* Note: Other modals (AI, Excel đã có ở trên) */}
    </div>
  );
};

export default ProductAdmin;
