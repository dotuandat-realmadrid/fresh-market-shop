import React, { useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Table, Dropdown, Space, Spin, message, Badge } from 'antd';
import { 
  MoreOutlined, 
  ShoppingCartOutlined, 
  DollarOutlined, 
  TeamOutlined
} from '@ant-design/icons';
import { Link } from 'react-router-dom';
import Chart from 'react-apexcharts';
import { IMAGE_URL, DEFAULT_IMAGE } from '../../api/auth';
import { 
  getSalesStatistics, 
  getTimeSeriesStatistics, 
  getRecentRevenue, 
  getTopProducts, 
  getRecentActivities, 
  getLowStockProducts, 
  getExpiringReceipts 
} from '../../api/home';
import './HomeAdmin.css';

const HomeAdmin = () => {
  // --- States for Statistics ---
  const [saleStats, setSaleStats] = useState([]);
  const [loadingStats, setLoadingStats] = useState(true);
  
  // --- Filter states ---
  const [salesFilter, setSalesFilter] = useState('today');
  const [revenueFilter, setRevenueFilter] = useState('thisMonth');
  const [customersFilter, setCustomersFilter] = useState('thisYear');
  const [reportsFilter, setReportsFilter] = useState('thisMonth');
  const [recentSalesFilter, setRecentSalesFilter] = useState('thisMonth');
  const [topSellingFilter, setTopSellingFilter] = useState('thisMonth');
  const [activityFilter, setActivityFilter] = useState('today');
  const [lowStockThreshold, setLowStockThreshold] = useState(30);
  const [expiringFilter, setExpiringFilter] = useState('thismonth');

  // --- Data states ---
  const [chartData, setChartData] = useState({ series: [], categories: [] });
  const [loadingChart, setLoadingChart] = useState(false);
  const [recentSales, setRecentSales] = useState([]);
  const [loadingRecentSales, setLoadingRecentSales] = useState(false);
  const [topProducts, setTopProducts] = useState([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);
  const [activities, setActivities] = useState([]);
  const [loadingActivities, setLoadingActivities] = useState(false);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [loadingLowStock, setLoadingLowStock] = useState(false);
  const [expiringReceipts, setExpiringReceipts] = useState([]);
  const [loadingExpiring, setLoadingExpiring] = useState(false);
  const [, setTick] = useState(0);

  // --- Initial Load ---
  useEffect(() => {
    fetchMainStats();
  }, []);

  const fetchMainStats = async () => {
    try {
      setLoadingStats(true);
      const data = await getSalesStatistics();
      setSaleStats(data);
    } catch (error) {
      console.error("Error loading sale stats:", error);
    } finally {
      setLoadingStats(false);
    }
  };

  const getStatByPeriod = (period) => {
    return saleStats.find(s => s.period === period) || {};
  };

  // --- Load Chart ---
  useEffect(() => {
    const fetchChart = async () => {
      try {
        setLoadingChart(true);
        const data = await getTimeSeriesStatistics(reportsFilter);
        setChartData({
          series: [
            { name: 'Bán hàng', data: data.map(item => item.totalProductsSold) },
            { name: 'Doanh thu', data: data.map(item => item.totalRevenue) },
            { name: 'Khách hàng', data: data.map(item => item.totalCustomers) }
          ],
          categories: data.map(item => item.timestamp)
        });
      } catch (error) {
        console.error("Error loading chart:", error);
      } finally {
        setLoadingChart(false);
      }
    };
    fetchChart();
  }, [reportsFilter]);

  // --- Load Other Sections ---
  useEffect(() => {
    const fetchRecentSales = async () => {
      setLoadingRecentSales(true);
      try {
        const data = await getRecentRevenue(recentSalesFilter);
        setRecentSales(data);
      } finally { setLoadingRecentSales(false); }
    };
    fetchRecentSales();
  }, [recentSalesFilter]);

  useEffect(() => {
    const fetchTopProducts = async () => {
      setLoadingTopProducts(true);
      try {
        const data = await getTopProducts(topSellingFilter);
        setTopProducts(data);
      } finally { setLoadingTopProducts(false); }
    };
    fetchTopProducts();
  }, [topSellingFilter]);

  useEffect(() => {
    const fetchActivities = async () => {
      setLoadingActivities(true);
      try {
        const data = await getRecentActivities(activityFilter);
        setActivities(data);
      } finally { setLoadingActivities(false); }
    };
    fetchActivities();
  }, [activityFilter]);

  useEffect(() => {
    const interval = setInterval(() => setTick(n => n + 1), 10000); 
    return () => clearInterval(interval);
  }, []);

  // --- Real-time Activity Logs via WebSocket ---
  useEffect(() => {
    // Sử dụng @stomp/stompjs kết nối qua WebSocket nguyên bản
    import('@stomp/stompjs').then(({ Client }) => {
      const client = new Client({
        brokerURL: 'ws://localhost:8088/fresh-market/ws', // Chỉnh đúng port 8088 và context-path
        reconnectDelay: 5000,
        heartbeatIncoming: 4000,
        heartbeatOutgoing: 4000,
      });

      client.onConnect = (frame) => {
        console.log('Connected to WebSocket (Native)');
        client.subscribe('/topic/activities', (stompMessage) => {
          const newActivity = JSON.parse(stompMessage.body);
          // Cập nhật state để hiển thị ngay trên UI
          setActivities((prev) => [newActivity, ...prev].slice(0, 50));
          
          // Hiển thị thông báo góc màn hình
          // message.success(`Có hoạt động mới: ${newActivity.description}`);
        });
      };

      client.onStompError = (frame) => {
        console.error('Broker reported error: ' + frame.headers['message']);
      };

      client.activate();

      return () => {
        if (client) client.deactivate();
      };
    });
  }, []);

  useEffect(() => {
    const fetchLowStock = async () => {
      setLoadingLowStock(true);
      try {
        const data = await getLowStockProducts(lowStockThreshold);
        setLowStockProducts(data);
      } finally { setLoadingLowStock(false); }
    };
    fetchLowStock();
  }, [lowStockThreshold]);

  useEffect(() => {
    const fetchExpiring = async () => {
      setLoadingExpiring(true);
      try {
        const data = await getExpiringReceipts(expiringFilter);
        setExpiringReceipts(data);
      } finally { setLoadingExpiring(false); }
    };
    fetchExpiring();
  }, [expiringFilter]);

  // --- Chart Options ---
  const revenueUnit = reportsFilter === 'today' ? 'nghìn VNĐ' : reportsFilter === 'thisMonth' ? 'triệu VNĐ' : 'tỷ VNĐ';
  const datetimeFormat = reportsFilter === 'today' ? 'HH:mm' : reportsFilter === 'thisMonth' ? 'dd/MM' : 'MM/yyyy';
  
  const apexOptions = {
    chart: { 
      height: 350, 
      type: 'area', 
      toolbar: { 
        show: false
      }
    },
    markers: { size: 4 },
    colors: ['#4154f1', '#2eca6a', '#ff771d'],
    fill: {
      type: "gradient",
      gradient: { shadeIntensity: 1, opacityFrom: 0.3, opacityTo: 0.4, stops: [0, 90, 100] }
    },
    dataLabels: { enabled: false },
    stroke: { curve: 'smooth', width: 2 },
    xaxis: { type: 'datetime', categories: chartData.categories, labels: { format: datetimeFormat } },
    legend: {
      position: 'bottom',
      horizontalAlign: 'center',
    },
    zoom: {
      enabled: true,
      type: 'x',
      autoScaleYaxis: false,
      zoomedArea: {
        fill: {
          color: '#90CAF9',
          opacity: 0.4
        },
        stroke: {
          color: '#0D47A1',
          opacity: 0.4,
          width: 1
        }
      }
    },
    scroller: {
      enabled: true
    },
    tooltip: {
      x: { format: datetimeFormat },
      y: [
        { formatter: (v) => `${v} sản phẩm` },
        { formatter: (v) => `${v} ${revenueUnit}` },
        { formatter: (v) => `${v} người` }
      ]
    }
  };

  // --- Filter Dropdown Menu Factory ---
  const getFilterMenu = (setFilter, options) => ({
    items: options.map(opt => ({
      key: opt.value,
      label: opt.label,
      onClick: () => setFilter(opt.value)
    }))
  });

  const timeOptions = [
    { label: 'Hôm nay', value: 'today' },
    { label: 'Tháng này', value: 'thisMonth' },
    { label: 'Năm nay', value: 'thisYear' }
  ];

  // --- Relative Time Helper ---
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffSeconds = Math.floor((now - activityTime) / 1000);
    const diffMinutes = Math.floor(diffSeconds / 60);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSeconds < 60) return `${diffSeconds} giây`;
    if (diffMinutes < 60) return `${diffMinutes} phút`;
    if (diffHours < 24) return `${diffHours} giờ`;
    return `${diffDays} ngày`;
  };

  // --- Table Columns ---
  const recentSalesColumns = [
    { title: 'STT', dataIndex: 'stt', key: 'stt', width: 60, align: 'center', render: (_, __, index) => index + 1 },
    { title: 'Khách hàng', dataIndex: 'fullName', key: 'fullName' },
    { 
      title: 'Sản phẩm', 
      dataIndex: 'details', 
      key: 'details',
      render: (details) => (
        <div className="scroll-scroll" style={{ maxHeight: 60, overflowY: 'auto' }}>
          {details.map((d, i) => <div key={i}>{d.productName}</div>)}
        </div>
      )
    },
    { title: 'Giá(VNĐ)', dataIndex: 'totalPrice', key: 'totalPrice', render: (price) => `${price.toLocaleString()}` },
    { 
      title: 'Trạng thái', 
      dataIndex: 'status', 
      key: 'status',
      align: 'center',
      render: (status) => {
        let color = 'warning';
        if (status === 'COMPLETED') color = 'success';
        if (status === 'CANCELLED' || status === 'FAILED') color = 'danger';
        if (status === 'CONFIRMED') color = 'info';
        if (status === 'SHIPPING') color = 'primary';
        return <span className={`badge bg-${color}`}>{status}</span>;
      }
    }
  ];

  const topSellingColumns = [
    { 
      title: 'Xem trước', 
      dataIndex: 'images', 
      key: 'image', 
      width: 100, 
      align: 'center',
      render: (images) => <img src={images?.length > 0 ? `${IMAGE_URL}/${images[0]}` : DEFAULT_IMAGE} alt="product" />
    },
    { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (val, record) => `${(record.discountPrice || val).toLocaleString()} VNĐ` },
    { title: 'Đã bán', dataIndex: 'soldQuantity', key: 'soldQuantity', align: 'center', render: (v) => <b>{v}</b> },
    { 
      title: 'Doanh thu', 
      key: 'revenue', 
      render: (_, record) => `${((record.discountPrice || record.price) * record.soldQuantity).toLocaleString()} VNĐ` 
    }
  ];

  const lowStockColumns = [
    { title: 'Sản phẩm', dataIndex: 'name', key: 'name' },
    { title: 'Tồn kho', dataIndex: 'inventoryQuantity', key: 'inventoryQuantity' },
    { title: 'Đã bán', dataIndex: 'soldQuantity', key: 'soldQuantity' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (v) => `${v.toLocaleString()} VNĐ` }
  ];

  const expiringColumns = [
    { 
      title: 'Sản phẩm', 
      dataIndex: 'detailResponses', 
      key: 'product',
      render: (details) => details.map((d, i) => <div key={i}>{d.productCode}</div>)
    },
    { 
      title: 'Số lượng', 
      dataIndex: 'detailResponses', 
      key: 'qty',
      render: (details) => details.map((d, i) => <div key={i}>{d.quantity}</div>)
    },
    { 
      title: 'Ngày sản xuất', 
      dataIndex: 'detailResponses', 
      key: 'mfg',
      render: (details) => details.map((d, i) => <div key={i}>{new Date(d.manufacturedDate).toLocaleDateString()}</div>)
    },
    { 
      title: 'Hạn sử dụng', 
      dataIndex: 'detailResponses', 
      key: 'exp',
      render: (details) => details.map((d, i) => <div key={i}>{new Date(d.expiryDate).toLocaleDateString()}</div>)
    }
  ];

  const getFilterLabel = (val) => {
    const found = timeOptions.find(o => o.value === val);
    return found ? found.label : val;
  };

  return (
    <div className="admin-dashboard p-1">
      <div className="pagetitle mb-4">
        <h1>Tổng quan</h1>
        <nav>
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item active">Tổng quan</li>
          </ol>
        </nav>
      </div>

      <Row gutter={[20, 20]}>
        {/* Left Side */}
        <Col lg={16}>
          <Row gutter={[20, 20]}>
            {/* Sales Card */}
            <Col lg={8} md={12}>
              <Card className="info-card sales-card shadow-sm" variant="borderless">
                <div className="filter position-absolute" style={{ top: 15, right: 15 }}>
                  <Dropdown menu={getFilterMenu(setSalesFilter, timeOptions)} trigger={['click']}>
                    <MoreOutlined className="cursor-pointer text-muted" />
                  </Dropdown>
                </div>
                <div className="card-body p-0">
                  <h5 className="card-title">Bán hàng <span>| {getFilterLabel(salesFilter)}</span></h5>
                  <div className="d-flex align-items-center mt-3">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <ShoppingCartOutlined />
                    </div>
                    <div className="ps-3 d-flex flex-column align-items-start">
                      <p className="fw-bold fs-4 mb-0">{getStatByPeriod(salesFilter).totalProductsSold?.toLocaleString() || 0}</p>
                      <div className="d-flex align-items-center mt-1">
                        <span className={`${getStatByPeriod(salesFilter).salesGrowthPercent >= 0 ? 'text-success' : 'text-danger'} small fw-bold me-1`}>
                          {Math.abs(getStatByPeriod(salesFilter).salesGrowthPercent || 0)}%
                        </span>
                        <span className="text-muted small">
                          {getStatByPeriod(salesFilter).salesGrowthPercent >= 0 ? 'tăng' : 'giảm'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Revenue Card */}
            <Col lg={8} md={12}>
              <Card className="info-card revenue-card shadow-sm" variant="borderless">
                <div className="filter position-absolute" style={{ top: 15, right: 15 }}>
                  <Dropdown menu={getFilterMenu(setRevenueFilter, timeOptions)} trigger={['click']}>
                    <MoreOutlined className="cursor-pointer text-muted" />
                  </Dropdown>
                </div>
                <div className="card-body p-0">
                  <h5 className="card-title">Doanh thu <span>| {getFilterLabel(revenueFilter)}</span></h5>
                  <div className="d-flex align-items-center mt-3">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <span className="fw-bold fs-5">VNĐ</span>
                    </div>
                    <div className="ps-3 d-flex flex-column align-items-start">
                      <p className="fw-bold fs-4 mb-0">{getStatByPeriod(revenueFilter).totalRevenue?.toLocaleString() || 0}</p>
                      <div className="d-flex align-items-center mt-1">
                        <span className={`${getStatByPeriod(revenueFilter).revenueGrowthPercent >= 0 ? 'text-success' : 'text-danger'} small fw-bold me-1`}>
                          {Math.abs(getStatByPeriod(revenueFilter).revenueGrowthPercent || 0)}%
                        </span>
                        <span className="text-muted small">
                          {getStatByPeriod(revenueFilter).revenueGrowthPercent >= 0 ? 'tăng' : 'giảm'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Customers Card */}
            <Col lg={8} md={24}>
              <Card className="info-card customers-card shadow-sm" variant="borderless">
                <div className="filter position-absolute" style={{ top: 15, right: 15 }}>
                  <Dropdown menu={getFilterMenu(setCustomersFilter, timeOptions)} trigger={['click']}>
                    <MoreOutlined className="cursor-pointer text-muted" />
                  </Dropdown>
                </div>
                <div className="card-body p-0">
                  <h5 className="card-title">Khách hàng <span>| {getFilterLabel(customersFilter)}</span></h5>
                  <div className="d-flex align-items-center mt-3">
                    <div className="card-icon rounded-circle d-flex align-items-center justify-content-center">
                      <TeamOutlined />
                    </div>
                    <div className="ps-3 d-flex flex-column align-items-start">
                      <p className="fw-bold fs-4 mb-0">{getStatByPeriod(customersFilter).totalCustomers?.toLocaleString() || 0}</p>
                      <div className="d-flex align-items-center mt-1">
                        <span className={`${getStatByPeriod(customersFilter).customersGrowthPercent >= 0 ? 'text-success' : 'text-danger'} small fw-bold me-1`}>
                          {Math.abs(getStatByPeriod(customersFilter).customersGrowthPercent || 0)}%
                        </span>
                        <span className="text-muted small">
                          {getStatByPeriod(customersFilter).customersGrowthPercent >= 0 ? 'tăng' : 'giảm'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </Col>

            {/* Reports Area Chart */}
            <Col span={24}>
              <Card className="shadow-sm reports-card" variant="borderless">
                <div className="filter position-absolute" style={{ top: 15, right: 15, zIndex: 10 }}>
                  <Dropdown menu={getFilterMenu(setReportsFilter, timeOptions)} trigger={['click']}>
                    <MoreOutlined className="cursor-pointer text-muted" />
                  </Dropdown>
                </div>
                <div className="card-body p-0">
                  <h5 className="card-title">Báo cáo <span>/ {getFilterLabel(reportsFilter)}</span></h5>
                  {loadingChart ? <div className="text-center py-5"><Spin /></div> : (
                    <Chart options={apexOptions} series={chartData.series} type="area" height={350} />
                  )}
                </div>
              </Card>
            </Col>

            {/* Recent Sales Table */}
            <Col span={24}>
              <Card className="shadow-sm recent-sales overflow-auto" variant="borderless">
                <div className="filter position-absolute" style={{ top: 15, right: 15, zIndex: 10 }}>
                  <Dropdown menu={getFilterMenu(setRecentSalesFilter, timeOptions)} trigger={['click']}>
                    <MoreOutlined className="cursor-pointer text-muted" />
                  </Dropdown>
                </div>
                <h5 className="card-title mb-3">Doanh số gần đây <span>| {getFilterLabel(recentSalesFilter)}</span></h5>
                <Table 
                  columns={recentSalesColumns} 
                  dataSource={recentSales} 
                  pagination={false} 
                  loading={loadingRecentSales}
                  rowKey="id"
                  bordered
                />
              </Card>
            </Col>

            {/* Top Selling Products */}
            <Col span={24}>
              <Card className="shadow-sm top-selling overflow-auto" variant="borderless">
                <div className="filter position-absolute" style={{ top: 15, right: 15, zIndex: 10 }}>
                  <Dropdown menu={getFilterMenu(setTopSellingFilter, timeOptions)} trigger={['click']}>
                    <MoreOutlined className="cursor-pointer text-muted" />
                  </Dropdown>
                </div>
                <h5 className="card-title mb-3">Bán chạy nhất <span>| {getFilterLabel(topSellingFilter)}</span></h5>
                <Table 
                  columns={topSellingColumns} 
                  dataSource={topProducts} 
                  pagination={false} 
                  loading={loadingTopProducts}
                  rowKey="code"
                  bordered
                />
              </Card>
            </Col>
          </Row>
        </Col>

        {/* Right Side */}
        <Col lg={8}>
          <Space orientation="vertical" size={20} className="w-100">
            {/* Recent Activity */}
            <Card className="shadow-sm" variant="borderless">
              <div className="filter position-absolute" style={{ top: 15, right: 15 }}>
                <Dropdown menu={getFilterMenu(setActivityFilter, timeOptions)} trigger={['click']}>
                  <MoreOutlined className="cursor-pointer text-muted" />
                </Dropdown>
              </div>
              <h5 className="card-title mb-4">Hoạt động gần đây <span>| {getFilterLabel(activityFilter)}</span></h5>
              <div className="activity scroll-scroll" style={{ maxHeight: '440px', overflowY: 'auto' }}>
                {loadingActivities ? <Spin /> : activities.map((act, index) => {
                  let dotColor = 'grey';
                  if (act.actionType === 'CREATE') dotColor = '#17a2b8';
                  if (act.actionType === 'UPDATE') dotColor = '#007bff';
                  if (act.actionType === 'DELETE') dotColor = '#dc3545';
                  if (act.actionType === 'LOGIN') dotColor = '#28a745';
                  if (act.actionType === 'PAYMENT') dotColor = '#ffc107'; // Màu vàng cho thanh toán
                  
                  return (
                    <div key={act.id || index} className="activity-item d-flex align-items-start mb-3">
                      <div className="activite-label text-muted" style={{ minWidth: 70, fontSize: 13 }}>{getRelativeTime(act.timestamp)}</div>
                      <span className="activity-badge-dot" style={{ backgroundColor: dotColor }}></span>
                      <div className="activity-content flex-grow-1" style={{ fontSize: 14 }}>
                        {act.description} <Link to="#" className="fw-bold">{act.username}</Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card>

            {/* Low Stock Products */}
            <Card className="shadow-sm" variant="borderless">
              <div className="filter position-absolute" style={{ top: 15, right: 15 }}>
                <Dropdown 
                  menu={getFilterMenu(setLowStockThreshold, [
                    { label: 'Thấp hơn 10', value: 10 },
                    { label: 'Thấp hơn 30', value: 30 },
                    { label: 'Thấp hơn 50', value: 50 },
                  ])} 
                  trigger={['click']}
                >
                  <MoreOutlined className="cursor-pointer text-muted" />
                </Dropdown>
              </div>
              <h5 className="card-title mb-3">Sản phẩm sắp hết hàng <span>| SL: {lowStockThreshold}</span></h5>
              <div className="scroll-scroll" style={{ maxHeight: 360, overflowY: 'auto' }}>
                <Table 
                  columns={lowStockColumns} 
                  dataSource={lowStockProducts} 
                  pagination={false} 
                  loading={loadingLowStock} 
                  size="small"
                  rowKey="code"
                  bordered
                />
              </div>
            </Card>

            {/* Expiring Products */}
            <Card className="shadow-sm" variant="borderless">
              <div className="filter position-absolute" style={{ top: 15, right: 15 }}>
                <Dropdown 
                  menu={getFilterMenu(setExpiringFilter, [
                    { label: 'Hôm nay', value: 'today' },
                    { label: 'Tháng này', value: 'thismonth' },
                    { label: 'Năm nay', value: 'thisyear' },
                  ])} 
                  trigger={['click']}
                >
                  <MoreOutlined className="cursor-pointer text-muted" />
                </Dropdown>
              </div>
              <h5 className="card-title mb-3">Sản phẩm sắp hết hạn <span>| {getFilterLabel(expiringFilter === 'thismonth' ? 'thisMonth' : expiringFilter === 'thisyear' ? 'thisYear' : expiringFilter)}</span></h5>
              <div className="scroll-scroll" style={{ maxHeight: 360, overflowY: 'auto' }}>
                <Table 
                  columns={expiringColumns} 
                  dataSource={expiringReceipts} 
                  pagination={false} 
                  loading={loadingExpiring} 
                  size="small"
                  rowKey="id"
                  bordered
                />
              </div>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default HomeAdmin;
