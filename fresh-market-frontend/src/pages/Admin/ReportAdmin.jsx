import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Card,
  Col,
  message,
  Row,
  Spin,
  Typography,
} from "antd";
import {
  FileTextOutlined,
  DollarCircleOutlined,
  InboxOutlined,
  LineChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
} from "@ant-design/icons";
import {
  getOrderSummary,
  getMonthlyRevenueTrend,
  getRevenueByOrderType,
  getCategoryReport,
  getSupplierReport,
  getUserGrowth,
  getTop5ProductsByRevenue,
  getBottom5ProductsByRevenue,
} from "../../api/report";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
import "../Admin/AccountAdmin.css";

const { Text } = Typography;

// Utilities
const formatCurrency = (val) => `${val?.toLocaleString("vi-VN") || 0}đ`;

// Colors
const PIE_COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#f06292", "#ba68c8"];

export default function ReportAdmin() {
  const [loading, setLoading] = useState(true);

  // States
  const [summary, setSummary] = useState(null);
  const [orderTypeData, setOrderTypeData] = useState([]);
  const [weeklyTrendData, setWeeklyTrendData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [supplierData, setSupplierData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [bottomProducts, setBottomProducts] = useState([]);
  const [userGrowth, setUserGrowth] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [
          sumRes,
          typeRes,
          weekRes,
          catRes,
          supRes,
          topRes,
          botRes,
          usrRes,
        ] = await Promise.all([
          getOrderSummary(),
          getRevenueByOrderType(),
          getMonthlyRevenueTrend(),
          getCategoryReport(),
          getSupplierReport(),
          getTop5ProductsByRevenue(),
          getBottom5ProductsByRevenue(),
          getUserGrowth(),
        ]);

        // Process summary
        setSummary(sumRes);

        // Process Order Type
        const formattedType = typeRes.map((v) => ({
          name: v.orderType === "ONLINE" ? "Trực tuyến" : "Tại cửa hàng",
          revenue: v.totalRevenue || 0,
          revenueM: Number(((v.totalRevenue || 0) / 1000000).toFixed(2)),
          orders: v.totalOrders || 0,
        }));
        setOrderTypeData(formattedType);

        // Process Weekly Trend
        const formattedWeek = weekRes.map((v) => ({
          name: `Tuần ${v.weekOfYear}/${v.year}`,
          revenue: v.totalRevenue || 0,
          revenueM: Number(((v.totalRevenue || 0) / 1000000).toFixed(2)),
          orders: v.totalOrders || 0,
        }));
        setWeeklyTrendData(formattedWeek);

        // Process Category
        setCategoryData(catRes.filter((c) => c.totalRevenue > 0));

        // Process Supplier
        setSupplierData(supRes.filter((s) => s.totalRevenue > 0));

        // Process Top/Bottom (ensure revenue is present)
        setTopProducts(
          topRes.map((p) => ({
            name: p.name,
            revenue: p.totalRevenue || 0,
            revenueM: Number(((p.totalRevenue || 0) / 1000000).toFixed(2)),
            quantity: p.totalSoldQuantity || 0,
          }))
        );
        setBottomProducts(
          botRes.map((p) => ({
            name: p.name,
            revenue: p.totalRevenue || 0,
            revenueM: Number(((p.totalRevenue || 0) / 1000000).toFixed(2)),
            quantity: p.totalSoldQuantity || 0,
          }))
        );

        // Process User Growth
        const sortedUsrRes = usrRes.sort((a, b) =>
          a.year === b.year ? a.weekOfYear - b.weekOfYear : a.year - b.year
        );
        let totalU = 0;
        const formattedUsr = sortedUsrRes.map((u) => {
          totalU += u.newUsers || 0;
          return {
            name: `Tuần ${u.weekOfYear}/${u.year}`,
            newUsers: u.newUsers || 0,
            totalUsers: totalU,
          };
        });
        setUserGrowth(formattedUsr);
      } catch (err) {
        console.error(err);
        message.error("Có lỗi xảy ra khi tải dữ liệu báo cáo.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Summary rendering
  const renderSummaryCard = () => {
    if (!summary) return null;
    const profit = (summary.totalRevenue || 0) - (summary.totalInventoryPrice || 0);
    const isProfit = profit >= 0;

    return (
      <Card
        title="Tổng quan đơn hàng"
        bordered={false}
        className="shadow-sm rounded-4 mb-4"
        style={{ borderRadius: 16 }}
      >
        <Row gutter={[16, 24]}>
          <Col xs={24} sm={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <FileTextOutlined style={{ fontSize: 28, color: "#1890ff" }} />
              <div>
                <Text type="secondary">Tổng đơn</Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {summary.totalOrders || 0}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <DollarCircleOutlined style={{ fontSize: 28, color: "#faad14" }} />
              <div>
                <Text type="secondary">Tổng doanh thu</Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {formatCurrency(summary.totalRevenue)}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <InboxOutlined style={{ fontSize: 28, color: "#8c8c8c" }} />
              <div>
                <Text type="secondary">Tổng giá nhập</Text>
                <div>
                  <Text strong style={{ fontSize: 18 }}>
                    {formatCurrency(summary.totalInventoryPrice)}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
          <Col xs={24} sm={12}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <LineChartOutlined
                style={{ fontSize: 28, color: isProfit ? "#52c41a" : "#f5222d" }}
              />
              <div>
                <Text type="secondary">Lợi nhuận</Text>
                <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                  {isProfit ? (
                    <ArrowUpOutlined style={{ color: "#52c41a" }} />
                  ) : (
                    <ArrowDownOutlined style={{ color: "#f5222d" }} />
                  )}
                  <Text
                    strong
                    style={{ fontSize: 18, color: isProfit ? "#52c41a" : "#f5222d" }}
                  >
                    {formatCurrency(Math.abs(profit))}
                  </Text>
                </div>
              </div>
            </div>
          </Col>
        </Row>
      </Card>
    );
  };

  // Generic renderers
  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div style={{ background: "#fff", padding: 10, border: "1px solid #ddd", borderRadius: 4 }}>
          <p style={{ margin: 0 }}><strong>{data.categoryName || data.supplierName}</strong></p>
          <p style={{ margin: 0 }}>Số lượng bán: {data.totalSoldQuantity}</p>
          <p style={{ margin: 0 }}>Doanh thu: {formatCurrency(data.totalRevenue)}</p>
        </div>
      );
    }
    return null;
  };

  const renderPieChart = (data, nameKey) => {
    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            dataKey="totalRevenue"
            nameKey={nameKey}
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
          >
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
            ))}
          </Pie>
          <RechartsTooltip content={<CustomPieTooltip />} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // Main Return
  return (
    <div className="account-admin-container">
      <div className="pagetitle mb-4">
        <h1>Báo cáo thống kê</h1>
        <nav>
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/admin/reports">Thống kê báo cáo</Link></li>
            <li className="breadcrumb-item active">Báo cáo thống kê</li>
          </ol>
        </nav>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "100px 0" }}>
          <Spin size="large" tip="Đang tải dữ liệu báo cáo..." />
        </div>
      ) : (
        <Row gutter={[24, 24]}>
          {/* 1. Tổng quan & 2. Order Type */}
          <Col xs={24} lg={12}>
            {renderSummaryCard()}
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title="Phân bổ đơn hàng (Tại cửa hàng & Online)"
              bordered={false}
              className="shadow-sm rounded-4 mb-4"
              style={{ borderRadius: 16, height: '100%' }}
            >
              <ResponsiveContainer width="100%" height={260}>
                <ComposedChart data={orderTypeData} margin={{ top: 20, right: 20, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" orientation="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip formatter={(val, name) => [name === 'Doanh thu (M)' ? `${val}M VNĐ` : val, name]} />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenueM" fill="#198754" name="Doanh thu (M)" barSize={40} />
                  <Bar yAxisId="right" dataKey="orders" fill="#6f42c1" name="Số đơn hàng" barSize={40} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 3. Weekly Trend */}
          <Col xs={24}>
            <Card
              title="Xu hướng doanh thu hàng tuần"
              bordered={false}
              className="shadow-sm rounded-4 mb-4"
              style={{ borderRadius: 16 }}
            >
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={weeklyTrendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip formatter={(val, name) => [name === 'Doanh thu (triệu VNĐ)' ? `${val}M VNĐ` : val, name]} />
                  <Legend />
                  <Bar yAxisId="right" dataKey="orders" fill="#ff69b4" name="Số đơn hàng" barSize={40} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="revenueM" stroke="#ffa500" name="Doanh thu (triệu VNĐ)" strokeWidth={3} dot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 4. Category & 5. Supplier */}
          <Col xs={24} lg={12}>
            <Card title="Doanh thu theo danh mục" bordered={false} className="shadow-sm rounded-4 mb-4" style={{ borderRadius: 16 }}>
              {renderPieChart(categoryData, "categoryName")}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Doanh thu theo nhà cung cấp" bordered={false} className="shadow-sm rounded-4 mb-4" style={{ borderRadius: 16 }}>
              {renderPieChart(supplierData, "supplierName")}
            </Card>
          </Col>

          {/* 6. Top 5 & 7. Bottom 5 */}
          <Col xs={24} lg={12}>
            <Card title="Top 5 sản phẩm có doanh thu cao nhất" bordered={false} className="shadow-sm rounded-4 mb-4" style={{ borderRadius: 16 }}>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={topProducts} layout="horizontal" margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} height={60} angle={-15} textAnchor="end" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip formatter={(val, name) => [name.includes('Doanh thu') ? `${val}M VNĐ` : val, name]} />
                  <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="revenueM" fill="#198754" name="Doanh thu (M)" barSize={30} />
                  <Bar yAxisId="right" dataKey="quantity" fill="#6f42c1" name="Số lượng bán" barSize={30} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Top 5 sản phẩm có doanh thu thấp nhất" bordered={false} className="shadow-sm rounded-4 mb-4" style={{ borderRadius: 16 }}>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={bottomProducts} layout="horizontal" margin={{ bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" interval={0} tick={{ fontSize: 11 }} height={60} angle={-15} textAnchor="end" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip formatter={(val, name) => [name.includes('Doanh thu') ? `${val}M VNĐ` : val, name]} />
                  <Legend wrapperStyle={{ position: 'relative', marginTop: '20px' }} />
                  <Bar yAxisId="left" dataKey="revenueM" fill="#198754" name="Doanh thu (M)" barSize={30} />
                  <Bar yAxisId="right" dataKey="quantity" fill="#6f42c1" name="Số lượng bán" barSize={30} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>

          {/* 8. User Growth */}
          <Col xs={24}>
            <Card title="Tăng trưởng người dùng" bordered={false} className="shadow-sm rounded-4 mb-4" style={{ borderRadius: 16 }}>
              <ResponsiveContainer width="100%" height={350}>
                <ComposedChart data={userGrowth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <RechartsTooltip />
                  <Legend />
                  <Bar yAxisId="right" dataKey="newUsers" fill="#48bb78" name="Người dùng mới" barSize={40} radius={[4, 4, 0, 0]} />
                  <Line yAxisId="left" type="monotone" dataKey="totalUsers" stroke="#6366f1" name="Tổng người dùng" strokeWidth={3} dot={{ r: 5 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </Card>
          </Col>
        </Row>
      )}
    </div>
  );
}
