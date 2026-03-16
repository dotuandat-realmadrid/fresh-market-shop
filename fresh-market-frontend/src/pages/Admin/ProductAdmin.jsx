import React, { useState, useEffect, useRef } from 'react';
import { 
  App, Table, Button, Input, Select, Radio, Checkbox, 
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
import jsQR from 'jsqr';
import { 
  ExclamationCircleOutlined,
  CloudUploadOutlined,
  DownloadOutlined
} from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import './ProductAdmin.css';
import CustomPagination from '../../components/CustomPagination/CustomPagination';
import { getAll as getAllCategories } from '../../api/category';
import { getAll as getAllSuppliers } from '../../api/supplier';
import { 
  searchProducts, createProduct, updateProduct, deleteProducts, 
  uploadProductImages, importProductsExcel, importProductsQR, 
  importProductsPDF, importProductsAI 
} from '../../api/product';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';

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
  
  // Form instance for add/edit
  const [form] = Form.useForm();
  const [pendingImages, setPendingImages] = useState([]);
  const [importAction, setImportAction] = useState('create');
  const [aiQuantity, setAiQuantity] = useState(5);
  const [excelFile, setExcelFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [qrFile, setQrFile] = useState(null);

  // QR Camera states
  const [scanning, setScanning] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const requestRef = useRef(null);

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

  // Import handlers
  const handleImportExcel = async (actionType) => {
    if (!excelFile) return message.warning("Vui lòng chọn file Excel");
    setLoading(true);
    try {
      await importProductsExcel(excelFile, actionType || importAction);
      message.success("Import Excel thành công");
      setIsImportExcelVisible(false);
      setExcelFile(null);
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Import Excel thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleImportAI = async () => {
    setLoading(true);
    try {
      await importProductsAI(aiQuantity);
      message.success(`Đã tạo ${aiQuantity} sản phẩm bằng AI`);
      setIsImportAIVisible(false);
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Tạo sản phẩm bằng AI thất bại");
    } finally {
      setLoading(false);
    }
  };

  const [qrContent, setQrContent] = useState("");

  const handleImportQR = async (actionType) => {
    // Determine source and data
    const source = qrFile ? 'file' : (qrContent ? 'camera' : null);
    const data = qrFile || qrContent;

    if (!data) return message.warning("Vui lòng chọn file QR hoặc quét mã bằng camera");
    
    setLoading(true);
    try {
      await importProductsQR(source, data, actionType || importAction);
      message.success("Import QR thành công");
      setIsImportQRVisible(false);
      setQrFile(null);
      setQrContent("");
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Import QR thất bại");
    } finally {
      setLoading(false);
    }
  };

  const handleImportQRData = (data) => {
    setQrContent(typeof data === 'object' ? JSON.stringify(data) : data);
    message.success("Đã nhận dữ liệu QR. Vui lòng chọn Thêm mới hoặc Cập nhật.");
  };

  const handleImportPDF = async (actionType) => {
    if (!pdfFile) return message.warning("Vui lòng chọn file PDF");
    setLoading(true);
    try {
      await importProductsPDF(pdfFile, actionType || importAction);
      message.success("Import PDF thành công");
      setIsImportPDFVisible(false);
      setPdfFile(null);
      fetchProducts();
    } catch (error) {
      message.error(error.message || "Import PDF thất bại");
    } finally {
      setLoading(false);
    }
  };

  // QR Scanning logic
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setScanning(true);
        requestRef.current = requestAnimationFrame(scanQRCode);
      }
    } catch (error) {
      message.error("Không thể mở camera: " + error.message);
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setScanning(false);
    if (requestRef.current) {
      cancelAnimationFrame(requestRef.current);
    }
  };

  const scanQRCode = () => {
    if (videoRef.current && canvasRef.current && scanning) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      if (video.readyState === video.HAVE_ENOUGH_DATA) {
        const ctx = canvas.getContext('2d', { willReadFrequently: true });
        canvas.height = video.videoHeight;
        canvas.width = video.videoWidth;
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: "dontInvert",
        });

        if (code) {
          message.success("Đã tìm thấy mã QR!");
          stopCamera();
          try {
            // Convert data string to object if it's JSON
            const qrData = JSON.parse(code.data);
            handleImportQRData(qrData);
          } catch (e) {
            // If not JSON, try calling with raw string
            handleImportQRData(code.data);
          }
        }
      }
      requestRef.current = requestAnimationFrame(scanQRCode);
    }
  };

  useEffect(() => {
    if (isImportQRVisible) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [isImportQRVisible]);

  const columns = [
    {
      title: 'STT',
      key: 'stt',
      width: 50,
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
          <Button type="link" icon={<FaEye />} href={`/admin/products/${record.code}`} />
        </Tooltip>
      ),
    },
  ];

  const importMenu = (
    <div className="import-export-dropdown">
        <div className="import-menu-item" onClick={() => { setIsImportExcelVisible(true); setIsImportDropdownOpen(false); }}>Import Excel</div>
        <div className="import-menu-item" onClick={() => { setIsImportQRVisible(true); setIsImportDropdownOpen(false); }}>Import QR</div>
        <div className="import-menu-item" onClick={() => { setIsImportPDFVisible(true); setIsImportDropdownOpen(false); }}>Import PDF</div>
        <div className="import-menu-item" onClick={() => { setIsImportAIVisible(true); setIsImportDropdownOpen(false); }}>Import AI</div>
    </div>
  );

  const exportMenu = (
    <div className="import-export-dropdown">
        <div className="import-menu-item" onClick={() => setIsExportDropdownOpen(false)}>Export Excel</div>
        <div className="import-menu-item" onClick={() => setIsExportDropdownOpen(false)}>Export PDF</div>
    </div>
  );

  return (
    <div className="product-admin-container">
      <div className="page-header">
        <h1 className="page-title">Danh sách sản phẩm</h1>
        <div className="breadcrumbs">
          <Link to="/admin">Home</Link> / <span>Quản lý sản phẩm</span> / <span className="active">Danh sách sản phẩm</span>
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
              <button className="btn-secondary" onClick={handleResetFilters} style={{ background: 'white' }}>
                <FaEraser /> Xóa bộ lọc
              </button>
              <button className="btn-primary" onClick={handleSearch}>
                <FaSearch /> Tìm kiếm
              </button>
            </div>
          </div>
        )}

        {/* Action Row */}
        <div className="table-actions-row">
          <div className="stats">
            <div>Tổng số: <span className="count">{totalElements}</span> sản phẩm</div>
            {selectedIds.length > 0 && (
              <button className="btn-danger" onClick={handleDeleteSelected}>
                <FaTrashAlt /> Xóa {selectedIds.length} sản phẩm
              </button>
            )}
          </div>
          <div className="action-buttons">
            <button className="btn-secondary" onClick={() => navigate('/admin/products/trash')} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FaTrashAlt /> Thùng rác
            </button>
            <button className="btn-primary" onClick={() => setIsAddModalVisible(true)}>
              <FaPlus /> Thêm mới
            </button>
            
            <Dropdown 
                popupRender={() => importMenu} 
                trigger={['click']} 
                placement="bottomRight"
                open={isImportDropdownOpen}
                onOpenChange={setIsImportDropdownOpen}
            >
                <button className="btn-success">
                    <FaFileImport /> Nhập <FaChevronDown size={10} />
                </button>
            </Dropdown>

            <Dropdown 
                popupRender={() => exportMenu} 
                trigger={['click']} 
                placement="bottomRight"
                open={isExportDropdownOpen}
                onOpenChange={setIsExportDropdownOpen}
            >
                <button className="btn-success">
                    <FaFileExport /> Xuất <FaChevronDown size={10} />
                </button>
            </Dropdown>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-responsive">
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
                        <button className="remove-img-btn" onClick={() => removePendingImage(idx)}>
                            <FaTimes />
                        </button>
                    </div>
                ))}
            </div>
            <Text type="secondary" style={{fontSize: 12}}>Có thể tải lên nhiều hình ảnh cùng lúc</Text>
          </div>

          <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: 20}}>
            <Button size="large" onClick={() => setIsAddModalVisible(false)} style={{marginRight: 10}}>Hủy</Button>
            <Button type="primary" size="large" htmlType="submit" loading={loading}>Thêm mới</Button>
          </div>
        </Form>
      </Modal>

      {/* Import Excel Modal */}
      <Modal
        title={<div className="modal-title-custom"><FaFileExcel /> Tải lên danh sách sản phẩm từ Excel</div>}
        open={isImportExcelVisible}
        onCancel={() => setIsImportExcelVisible(false)}
        footer={
          <div className="modal-footer">
            <button className="btn-gray-foot" onClick={() => setIsImportExcelVisible(false)}>Hủy</button>
            <button className="btn-blue-foot" onClick={() => handleImportExcel('update')}>
              <FaCloudUploadAlt /> Cập nhật
            </button>
            <button className="btn-blue-foot" onClick={() => handleImportExcel('create')}>
              <FaCloudUploadAlt /> Thêm mới
            </button>
          </div>
        }
        width={600}
        style={{ top: 20, marginBottom: 30 }}
      >
        <div className="import-guide">
            <div className="guide-title">
                <div className="guide-icon">!</div> Lưu ý khi tải lên
            </div>
            <ul>
                <li>File Excel phải đúng định dạng như mẫu</li>
                <li>Mã sản phẩm (code) và tiêu đề (name) không được để trống</li>
                <li>Giá (price) phải lớn hơn 1.000đ</li>
                <li>Nhấn "Thêm mới" để tạo sản phẩm mới hoặc "Cập nhật" để chỉnh sửa sản phẩm hiện có</li>
            </ul>
        </div>
        
        <button className="btn-green-download">
            <DownloadOutlined /> Tải xuống file mẫu Excel
        </button>

        <div className="drop-area" onClick={() => document.getElementById('excel-upload').click()}>
            <input 
                type="file" id="excel-upload" hidden 
                accept=".xlsx, .xls"
                onChange={e => setExcelFile(e.target.files[0])}
            />
            <div className="drop-area-icon"><CloudUploadOutlined /></div>
            <p className="drop-area-text">Kéo thả hoặc nhấn để chọn file Excel</p>
            <p className="drop-area-hint">Chỉ hỗ trợ tải lên file Excel (.xlsx, .xls)</p>
        </div>

        {excelFile && (
            <div className="file-item">
                <div className="file-info">
                    <FaLink /> {excelFile.name}
                </div>
                <div className="delete-file-btn" onClick={(e) => { e.stopPropagation(); setExcelFile(null); }}>
                    <FaTrash />
                </div>
            </div>
        )}
      </Modal>

      {/* Import AI Modal */}
      <Modal
        title={<div className="modal-title-custom"><FaRobot /> Tạo sản phẩm tự động bằng AI</div>}
        open={isImportAIVisible}
        onCancel={() => setIsImportAIVisible(false)}
        footer={
          <div className="modal-footer">
            <button className="btn-gray-foot" onClick={() => setIsImportAIVisible(false)}>Hủy</button>
            <button className="btn-blue-foot" onClick={handleImportAI}>
              <FaCloudUploadAlt /> Thêm
            </button>
          </div>
        }
        width={600}
        style={{ top: 20, marginBottom: 30 }}
      >
        <div className="import-guide">
            <div className="guide-title">
                <div className="guide-icon">!</div> Hướng dẫn sử dụng
            </div>
            <ul>
                <li>Nhập số lượng sản phẩm muốn tạo tự động.</li>
                <li>Dữ liệu sẽ được sinh ngẫu nhiên theo định dạng hợp lệ.</li>
                <li>Chỉ hỗ trợ thêm mới sản phẩm.</li>
                <li>Giới hạn tạo 100 sản phẩm.</li>
            </ul>
        </div>
        
        <div className="form-group" style={{marginBottom: 20}}>
            <label style={{fontSize: 18, color: '#334155', fontWeight: 400}}>Số lượng sản phẩm:</label>
            <InputNumber 
                min={1} max={100} 
                style={{width: '100%', height: 45, borderRadius: 8, display: 'flex', alignItems: 'center'}} 
                value={aiQuantity}
                onChange={setAiQuantity}
            />
        </div>
      </Modal>

      {/* Import QR Modal */}
      <Modal
        title={<div className="modal-title-custom"><FaQrcode /> Tải danh sách sản phẩm từ mã QR</div>}
        open={isImportQRVisible}
        onCancel={() => setIsImportQRVisible(false)}
        footer={
          <div className="modal-footer">
            <button className="btn-gray-foot" onClick={() => setIsImportQRVisible(false)}>Hủy</button>
            <button className="btn-blue-foot" onClick={() => handleImportQR('update')}>
              <FaCloudUploadAlt /> Cập nhật
            </button>
            <button className="btn-blue-foot" onClick={() => handleImportQR('create')}>
              <FaCloudUploadAlt /> Thêm mới
            </button>
          </div>
        }
        width={600}
        style={{ top: 20, marginBottom: 30 }}
      >
        <div className="camera-alert-blue">
            Vui lòng quét mã QR bằng camera trước. Nếu không quét được, bạn có thể tải lên hình ảnh mã QR.
        </div>

        <div className="qr-camera-container">
            <div className="camera-label">Quét mã QR bằng Camera</div>
            <div className="camera-preview-wrapper">
                <video ref={videoRef} className="camera-preview" playsInline muted />
                <canvas ref={canvasRef} style={{ display: 'none' }} />
            </div>
        </div>

        <div className="import-guide">
            <div className="guide-title">
                <div className="guide-icon">!</div> Lưu ý khi tải lên
            </div>
            <ul>
                <li>Ảnh mã QR phải rõ nét, không bị mờ hoặc mất góc</li>
                <li>Chỉ chấp nhận định dạng hình ảnh (JPG, PNG, BMP,...)</li>
                <li>Nhấn "Thêm mới" để tạo sản phẩm mới hoặc "Cập nhật" để chỉnh sửa sản phẩm hiện có</li>
            </ul>
        </div>

        <button className="btn-green-download">
            <DownloadOutlined /> Tải xuống file mẫu QR
        </button>

        <div className="drop-area" onClick={() => document.getElementById('qr-upload').click()}>
            <input 
                type="file" id="qr-upload" hidden 
                accept="image/*"
                onChange={e => setQrFile(e.target.files[0])}
            />
            <div className="drop-area-icon"><CloudUploadOutlined /></div>
            <p className="drop-area-text">Kéo thả hoặc nhấn để chọn hình ảnh</p>
            <p className="drop-area-hint">Chỉ hỗ trợ file ảnh (PNG, JPG, BMP,...)</p>
        </div>

        {qrFile && (
            <div className="file-item">
                <div className="file-info">
                    <FaLink /> {qrFile.name}
                </div>
                <div className="delete-file-btn" onClick={(e) => { e.stopPropagation(); setQrFile(null); }}>
                    <FaTrash />
                </div>
            </div>
        )}
      </Modal>

      {/* Import PDF Modal */}
      <Modal
        title={<div className="modal-title-custom"><FaFilePdf /> Tải lên danh sách sản phẩm từ PDF</div>}
        open={isImportPDFVisible}
        onCancel={() => setIsImportPDFVisible(false)}
        footer={
          <div className="modal-footer">
            <button className="btn-gray-foot" onClick={() => setIsImportPDFVisible(false)}>Hủy</button>
            <button className="btn-blue-foot" onClick={() => handleImportPDF('update')}>
              <FaCloudUploadAlt /> Cập nhật
            </button>
            <button className="btn-blue-foot" onClick={() => handleImportPDF('create')}>
              <FaCloudUploadAlt /> Thêm mới
            </button>
          </div>
        }
        width={600}
        style={{ top: 20, marginBottom: 30 }}
      >
        <div className="import-guide">
            <div className="guide-title">
                <div className="guide-icon">!</div> Lưu ý khi tải lên
            </div>
            <ul>
                <li>File PDF phải đúng định dạng như mẫu</li>
                <li>Mã sản phẩm (code) và tiêu đề (name) không được để trống</li>
                <li>Giá (price) phải lớn hơn 1.000đ</li>
                <li>Chọn "Thêm mới" để tạo sản phẩm mới hoặc "Cập nhật" để chỉnh sửa sản phẩm hiện có</li>
            </ul>
        </div>

        <button className="btn-green-download">
            <DownloadOutlined /> Tải xuống file mẫu PDF
        </button>

        <div className="drop-area" onClick={() => document.getElementById('pdf-upload').click()}>
            <input 
                type="file" id="pdf-upload" hidden 
                accept=".pdf"
                onChange={e => setPdfFile(e.target.files[0])}
            />
            <div className="drop-area-icon"><CloudUploadOutlined /></div>
            <p className="drop-area-text">Kéo thả hoặc nhấn để chọn file PDF</p>
            <p className="drop-area-hint">Chỉ hỗ trợ tải lên file PDF (.pdf)</p>
        </div>

        {pdfFile && (
            <div className="file-item">
                <div className="file-info">
                    <FaLink /> {pdfFile.name}
                </div>
                <div className="delete-file-btn" onClick={(e) => { e.stopPropagation(); setPdfFile(null); }}>
                    <FaTrash />
                </div>
            </div>
        )}
      </Modal>

      {/* Note: Other modals (AI, Excel đã có ở trên) */}
    </div>
  );
};

export default ProductAdmin;
