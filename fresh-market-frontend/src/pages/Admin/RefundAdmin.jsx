import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  Badge,
  Card,
  Descriptions,
  Modal,
  Space,
  Spin,
  Tag,
  Typography,
  Input,
  Form,
  message,
  Divider,
  Row,
  Col,
  Table,
} from "antd";
import MyButton from "../../components/MyButton";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  DollarOutlined,
  UserOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  MailOutlined,
  FileTextOutlined,
  FormOutlined,
  StopOutlined,
  ReloadOutlined,
  FilterOutlined,
} from "@ant-design/icons";

import {
  getRefundsByStatus,
  getRefundById,
  updateRefundStatus,
  countPendingRefunds,
} from "../../api/refund";
import { refundVNPay, queryVNPay } from "../../api/payment";
import { IMAGE_URL, DEFAULT_IMAGE } from "../../api/auth";
import CustomPagination from "../../components/CustomPagination/CustomPagination";
import dayjs from "dayjs";
import "../Admin/AccountAdmin.css";

const { Text, Title } = Typography;
const { TextArea } = Input;

/* ─────────────── constants ─────────────── */
const REFUND_STATUSES = [
  { code: "PENDING",   label: "Đang chờ xử lý", color: "#1677ff", icon: <ClockCircleOutlined /> },
  { code: "COMPLETED", label: "Đã hoàn thành",   color: "#52c41a", icon: <CheckCircleOutlined /> },
  { code: "REJECTED",  label: "Đã từ chối",      color: "#ff4d4f", icon: <CloseCircleOutlined /> },
];

const PAGE_SIZE = 5;

/* ─────────────── helpers ─────────────── */
const getRefundTypeLabel = (code) =>
  code === "02" ? "Hoàn tiền toàn phần" : code === "03" ? "Hoàn tiền một phần" : "N/A";

const formatDateToVNPay = (dateStr) => {
  if (!dateStr) return "";
  if (/^\d{14}$/.test(dateStr)) return dateStr;
  
  // Trích xuất trực tiếp yyyy, MM, dd, HH, mm, ss từ chuỗi để tránh lỗi tự động cộng/trừ múi giờ của JS Date
  const match = String(dateStr).match(/(\d{4})-(\d{2})-(\d{2})[T\s](\d{2}):(\d{2}):(\d{2})/);
  if (match) {
    return `${match[1]}${match[2]}${match[3]}${match[4]}${match[5]}${match[6]}`;
  }

  const fixed = dateStr.replace(/(\d{4}-\d{2}-\d{2})(\d{2}:\d{2}:\d{2})/, "$1T$2");
  try {
    const d = new Date(fixed);
    if (isNaN(d.getTime())) throw new Error();
    const p = (n) => String(n).padStart(2, "0");
    return `${d.getFullYear()}${p(d.getMonth()+1)}${p(d.getDate())}${p(d.getHours())}${p(d.getMinutes())}${p(d.getSeconds())}`;
  } catch { return ""; }
};

const formatPayDate = (s) => {
  if (!s || !/^\d{14}$/.test(s)) return "N/A";
  return `${s.substring(6,8)}/${s.substring(4,6)}/${s.substring(0,4)} ${s.substring(8,10)}:${s.substring(10,12)}:${s.substring(12,14)}`;
};

/* ══════════════════════════════════════════ COMPONENT ══════════════════════════════════════════ */
export default function RefundAdmin() {

  /* ── state ── */
  const [activeTab, setActiveTab]   = useState("PENDING");
  const [showSearch, setShowSearch] = useState(false);

  const [tabData, setTabData] = useState({
    PENDING:   { items: [], total: 0, page: 1, loading: false },
    COMPLETED: { items: [], total: 0, page: 1, loading: false },
    REJECTED:  { items: [], total: 0, page: 1, loading: false },
  });
  const [pendingCount, setPendingCount] = useState(0);

  /* detail modal */
  const [detailVisible, setDetailVisible]   = useState(false);
  const [selectedRefund, setSelectedRefund] = useState(null);
  const [detailLoading, setDetailLoading]   = useState(false);
  const [processing, setProcessing]         = useState(false);
  const [note, setNote]                     = useState("");

  /* search */
  const [searchForm]    = Form.useForm();
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchResult,  setSearchResult]  = useState(null);   // parsed VNPay object
  const [searchDone,    setSearchDone]    = useState(false);  // whether form was submitted

  /* ── fetch ── */
  const fetchTab = useCallback(async (status, page = 1) => {
    setTabData((p) => ({ ...p, [status]: { ...p[status], loading: true } }));
    try {
      const res = await getRefundsByStatus(status, page, PAGE_SIZE);
      setTabData((p) => ({
        ...p,
        [status]: {
          items:   res?.data           || [],
          total:   res?.totalElements  || 0,
          page:    res?.currentPage    || page,
          loading: false,
        },
      }));
    } catch (err) {
      console.error(err);
      setTabData((p) => ({ ...p, [status]: { ...p[status], loading: false } }));
      message.error(`Không thể tải danh sách hoàn tiền ${status}`);
    }
  }, []);

  const refreshAll = useCallback(() => {
    REFUND_STATUSES.forEach((s) => fetchTab(s.code, 1));
  }, [fetchTab]);

  useEffect(() => {
    refreshAll();
    countPendingRefunds().then(setPendingCount).catch(() => {});
  }, [refreshAll]);

  /* ── open detail ── */
  const openDetail = async (refundId) => {
    setDetailLoading(true);
    setDetailVisible(true);
    setNote("");
    try {
      const refund = await getRefundById(refundId);
      setSelectedRefund(refund);
      setNote(refund.note || "");
    } catch {
      message.error("Không thể tải chi tiết đơn hoàn tiền.");
      setDetailVisible(false);
    } finally {
      setDetailLoading(false);
    }
  };

  /* ── approve ── */
  const handleApprove = () => {
    if (!selectedRefund) return;
    const transDate = formatDateToVNPay(selectedRefund.transactionDate);
    if (!transDate) { message.error("Ngày giao dịch không hợp lệ."); return; }

    Modal.confirm({
      title: "Xác nhận đồng ý hoàn tiền",
      content: "Thao tác này sẽ gọi VNPay và cập nhật trạng thái sang COMPLETED. Tiếp tục?",
      okText: "Đồng ý", cancelText: "Hủy",
      onOk: async () => {
        setProcessing(true);
        try {
          const vnpayRes = await refundVNPay({
            trantype:   selectedRefund.code === "02" ? "02" : "03",
            order_id:   selectedRefund.orderId || "",
            amount:     selectedRefund.refundAmount || 0,
            trans_date: transDate,
            user:       "testuser",
          });
          const raw    = vnpayRes?.result;
          if (!raw) throw new Error("VNPay không trả về kết quả.");
          const result = typeof raw === "string" ? JSON.parse(raw) : raw;
          if (result.vnp_ResponseCode !== "00")
            throw new Error(result.vnp_Message || "VNPay lỗi không xác định.");

          await updateRefundStatus(selectedRefund.id, { status: "COMPLETED", note: note.trim() });
          message.success("Đã đồng ý hoàn tiền thành công!");
          setDetailVisible(false);
          refreshAll();
          countPendingRefunds().then(setPendingCount).catch(() => {});
        } catch (err) {
          message.error(err.message || "Xảy ra lỗi khi xử lý hoàn tiền.");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  /* ── reject ── */
  const handleReject = () => {
    if (!selectedRefund) return;
    Modal.confirm({
      title: "Xác nhận từ chối hoàn tiền",
      content: "Bạn có chắc chắn muốn từ chối đơn hoàn tiền này?",
      okText: "Từ chối", cancelText: "Hủy", okButtonProps: { danger: true },
      onOk: async () => {
        setProcessing(true);
        try {
          await updateRefundStatus(selectedRefund.id, { status: "REJECTED", note: note.trim() });
          message.success("Đã từ chối đơn hoàn tiền.");
          setDetailVisible(false);
          refreshAll();
          countPendingRefunds().then(setPendingCount).catch(() => {});
        } catch (err) {
          message.error(err.message || "Xảy ra lỗi khi từ chối.");
        } finally {
          setProcessing(false);
        }
      },
    });
  };

  /* ── vnpay search ── */
  const handleSearch = async (values) => {
    const transDate = formatDateToVNPay(values.transactionDate);
    if (!transDate) { message.error("Ngày giao dịch không hợp lệ. Dùng định dạng yyyy-MM-ddTHH:mm:ss"); return; }
    setSearchLoading(true);
    setSearchResult(null);
    setSearchDone(true);
    try {
      const res = await queryVNPay({ order_id: values.orderId, trans_date: transDate });
      const raw  = res?.result;
      if (!raw) throw new Error("Không có dữ liệu.");
      const clean  = typeof raw === "string" && raw.includes("}{") ? raw.split("}{")[0] + "}" : raw;
      const parsed = typeof clean === "string" ? JSON.parse(clean) : clean;
      setSearchResult(parsed);
    } catch (err) {
      message.error(err.message || "Lỗi tra cứu giao dịch.");
    } finally {
      setSearchLoading(false);
    }
  };

  const resetSearch = () => {
    searchForm.resetFields();
    setSearchResult(null);
    setSearchDone(false);
  };

  /* ── product table columns (modal) ── */
  const productCols = [
    {
      title: "Sản phẩm", key: "product",
      render: (_, item) => (
        <Space align="start">
          <img
            src={item.images?.[0] ? `${IMAGE_URL}/${item.images[0]}` : DEFAULT_IMAGE}
            alt={item.productName}
            style={{ width: 50, height: 50, objectFit: "contain", borderRadius: 4 }}
          />
          <Space orientation="vertical" size={0}>
            <Text strong style={{ fontSize: 13 }}>{item.productName || "N/A"}</Text>
            <Text type="secondary" style={{ fontSize: 11 }}>Mã: {item.productCode || "N/A"}</Text>
          </Space>
        </Space>
      ),
    },
    { title: "SL",      dataIndex: "quantity",        key: "qty",   width: 60,  align: "center" },
    { title: "Đơn giá", dataIndex: "priceAtPurchase",  key: "price", width: 110, align: "right",
      render: (v) => `${v?.toLocaleString()}đ` },
    { title: "Thành tiền", key: "total", width: 120, align: "right",
      render: (_, item) => (
        <Text style={{ color: "#cf1322" }}>
          {((item.quantity || 0) * (item.priceAtPurchase || 0)).toLocaleString()}đ
        </Text>
      ),
    },
  ];

  /* ─────────── sub‑components ─────────── */

  /* Tab bar — centered, pill style */
  const TabBar = () => {
    const activeInfo = REFUND_STATUSES.find((s) => s.code === activeTab);
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "16px 0 8px" }}>
        <div
          style={{
            display: "flex",
            background: "#fff",
            borderRadius: 32,
            boxShadow: "0 1px 8px rgba(0,0,0,0.08)",
            padding: "6px 8px",
            gap: 4,
          }}
        >
          {REFUND_STATUSES.map((s) => {
            const isActive = activeTab === s.code;
            return (
              <Badge
                key={s.code}
                count={s.code === "PENDING" ? pendingCount : 0}
                offset={[-6, 4]}
                style={{ backgroundColor: "#ff4d4f", fontSize: 10 }}
              >
                <MyButton
                  key={s.code}
                  onClick={() => setActiveTab(s.code)}
                  type={isActive ? "primary" : "text"}
                  style={{
                    padding: "7px 22px",
                    borderRadius: 24,
                    fontWeight: isActive ? 600 : 400,
                    fontSize: 14,
                    color: isActive ? "#fff" : "#555",
                    background: isActive ? s.color : "transparent",
                    borderColor: isActive ? s.color : "transparent",
                    transition: "all 0.2s",
                    whiteSpace: "nowrap",
                    height: "auto",
                  }}
                >
                  {s.label}
                </MyButton>
              </Badge>
            );
          })}
        </div>
      </div>
    );
  };

  /* Single refund card (mimics the jQuery design) */
  const RefundCard = ({ refund }) => (
    <div
      onClick={() => openDetail(refund.id)}
      style={{
        border: "1px solid #e8e8e8",
        borderRadius: 8,
        padding: "16px 20px",
        marginBottom: 12,
        cursor: "pointer",
        background: "#fff",
        display: "flex",
        gap: 16,
        transition: "box-shadow 0.2s",
      }}
      onMouseEnter={(e) => (e.currentTarget.style.boxShadow = "0 2px 10px rgba(0,0,0,0.10)")}
      onMouseLeave={(e) => (e.currentTarget.style.boxShadow = "none")}
    >
      {/* Left col — status + order info + customer */}
      <div style={{ width: 200, flexShrink: 0 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 2 }}>{refund.status}</div>
        <div style={{ fontSize: 11, color: "#888", marginBottom: 8, wordBreak: "break-all" }}>
          #{refund.orderId || "N/A"}
        </div>
        <div style={{ fontSize: 13, color: "#333" }}>{refund.fullName || "N/A"}</div>
        <div style={{ fontSize: 12, color: "#888" }}>{refund.phone || "N/A"}</div>
      </div>

      {/* Mid col — products (scrollable) */}
      <div
        style={{
          flex: 1,
          maxHeight: 140,
          overflowY: "auto",
          borderLeft: "1px solid #f0f0f0",
          borderRight: "1px solid #f0f0f0",
          paddingLeft: 16,
          paddingRight: 16,
        }}
        className="product-list-scroll"
      >
        {(refund.details || []).map((item, i) => (
          <div key={i} style={{ display: "flex", alignItems: "center", marginBottom: 10 }}>
            <img
              src={item.images?.[0] ? `${IMAGE_URL}/${item.images[0]}` : DEFAULT_IMAGE}
              alt={item.productName}
              style={{ width: 52, height: 52, objectFit: "contain", borderRadius: 4, marginRight: 10, flexShrink: 0 }}
            />
            <div>
              <div style={{ fontWeight: 600, fontSize: 13 }}>{item.productName || "N/A"}</div>
              <div style={{ fontSize: 11, color: "#999" }}>Mã: {item.productCode || "N/A"}</div>
              <div style={{ fontSize: 12, color: "#cf1322", fontWeight: 700 }}>
                {item.priceAtPurchase?.toLocaleString()}đ
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Right col — refund type + amount */}
      <div style={{ width: 160, flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", justifyContent: "center" }}>
        <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>
          {getRefundTypeLabel(refund.code)}
        </div>
        <div style={{ color: "#cf1322", fontWeight: 700, fontSize: 15 }}>
          {refund.refundAmount?.toLocaleString()}đ
        </div>
      </div>
    </div>
  );

  /* ─────────── Search panel ─────────── */
  const SearchPanel = () => (
    <div>
      {/* Search form card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: "20px 24px",
          marginBottom: 16,
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
        }}
      >
        <Title level={5} style={{ marginBottom: 20 }}>
          Tìm kiếm đơn giao dịch
        </Title>

        <Form form={searchForm} onFinish={handleSearch} layout="vertical">
          <Row gutter={24}>
            <Col xs={24} md={12}>
              <Form.Item
                label="Mã đơn hàng"
                name="orderId"
                rules={[{ required: true, message: "Vui lòng nhập mã đơn hàng" }]}
              >
                <Input
                  prefix={<FormOutlined style={{ color: "#bbb" }} />}
                  placeholder="Nhập mã đơn hàng"
                  size="middle"
                />
              </Form.Item>
            </Col>
            <Col xs={24} md={12}>
              <Form.Item
                label="Ngày giao dịch"
                name="transactionDate"
                rules={[{ required: true, message: "Vui lòng nhập ngày giao dịch" }]}
              >
                <Input
                  prefix={<span style={{ color: "#bbb", fontSize: 14 }}>📅</span>}
                  placeholder="yyyy-MM-ddThh:mm:ss (VD: 2025-08-20T12:28:5)"
                  size="middle"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* Buttons — right aligned */}
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 4 }}>
            <MyButton
              icon={<StopOutlined />}
              onClick={() => { setShowSearch(false); resetSearch(); }}
            >
              Hủy
            </MyButton>
            <MyButton icon={<ReloadOutlined />} onClick={resetSearch}>
              Xóa bộ lọc
            </MyButton>
            <MyButton
              type="primary"
              htmlType="submit"
              icon={<SearchOutlined />}
              loading={searchLoading}
            >
              Tìm kiếm
            </MyButton>
          </div>
        </Form>
      </div>

      {/* Result card */}
      <div
        style={{
          background: "#fff",
          borderRadius: 8,
          padding: "20px 24px",
          boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
          minHeight: 80,
        }}
      >
        <Title level={5} style={{ marginBottom: searchDone ? 16 : 0 }}>
          Thông tin giao dịch
        </Title>

        {searchLoading && (
          <div style={{ textAlign: "center", padding: "30px 0" }}>
            <Spin description="Đang tra cứu..." />
          </div>
        )}

        {!searchLoading && searchDone && !searchResult && (
          <Text type="secondary">Không tìm thấy giao dịch hoặc có lỗi xảy ra.</Text>
        )}

        {searchResult && (
          <Descriptions column={2} bordered size="small">
            <Descriptions.Item label="Trạng thái" span={2}>
              <Tag color={searchResult.vnp_TransactionStatus === "00" ? "green" : "red"}>
                {searchResult.vnp_TransactionStatus === "00" ? "Thành công" : "Thất bại"}
              </Tag>
            </Descriptions.Item>
            <Descriptions.Item label="Mã đơn hàng">{searchResult.vnp_TxnRef || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Ngân hàng">{searchResult.vnp_BankCode || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Số tiền">
              {searchResult.vnp_Amount != null
                ? `${(parseFloat(searchResult.vnp_Amount) / 100).toLocaleString("vi-VN")} VNĐ`
                : "N/A"}
            </Descriptions.Item>
            <Descriptions.Item label="Mã giao dịch">{searchResult.vnp_TransactionNo || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Ngày thanh toán">{formatPayDate(searchResult.vnp_PayDate || "")}</Descriptions.Item>
            <Descriptions.Item label="Loại giao dịch">{searchResult.vnp_TransactionType || "N/A"}</Descriptions.Item>
            <Descriptions.Item label="Thông tin đơn hàng" span={2}>{searchResult.vnp_OrderInfo || "N/A"}</Descriptions.Item>
            {searchResult.vnp_Message && (
              <Descriptions.Item label="Thông điệp" span={2}>{searchResult.vnp_Message}</Descriptions.Item>
            )}
          </Descriptions>
        )}
      </div>
    </div>
  );

  /* ─────────── main render ─────────── */
  const current = tabData[activeTab];

  return (
    <div className="account-admin-container">
      {/* Page header */}
      <div className="pagetitle mb-4">
        <h1>Danh sách hoàn tiền</h1>
        <nav>
          <ol className="breadcrumb mb-0" style={{ background: 'transparent', padding: 0 }}>
            <li className="breadcrumb-item"><Link to="/admin">Dashboard</Link></li>
            <li className="breadcrumb-item"><Link to="/admin/refunds">Quản lý hoàn tiền</Link></li>
            <li className="breadcrumb-item active">Danh sách hoàn tiền</li>
          </ol>
        </nav>
      </div>

      {showSearch ? (
        /* ═══ SEARCH PANEL ═══ */
        <SearchPanel />
      ) : (
        /* ═══ LIST ═══ */
        <>
          {/* Centered tab bar */}
          <TabBar />

          {/* List card */}
          <div
            style={{
              background: "#fff",
              borderRadius: 8,
              padding: "16px 20px 20px",
              boxShadow: "0 1px 4px rgba(0,0,0,0.06)",
              marginTop: 12,
            }}
          >
            {/* Stats + search button */}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <Text strong style={{ fontSize: 14 }}>
                Tổng số:{" "}
                <span style={{ color: "#1677ff" }}>{current.total}</span> đơn hàng
              </Text>
              <MyButton
                type="primary"
                icon={<SearchOutlined />}
                style={{ background: "#28a745", borderColor: "#28a745" }}
                onClick={() => setShowSearch(true)}
              >
                Tìm kiếm
              </MyButton>
            </div>

            {/* Cards */}
            {current.loading ? (
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <Spin size="large" />
              </div>
            ) : current.items.length === 0 ? (
              <div
                style={{
                  textAlign: "center",
                  padding: "60px 0",
                  color: "#999",
                }}
              >
                <FileTextOutlined style={{ fontSize: 40, marginBottom: 12, opacity: 0.3 }} />
                <p>Không có đơn hoàn tiền</p>
              </div>
            ) : (
              current.items.map((refund) => (
                <RefundCard key={refund.id} refund={refund} />
              ))
            )}

            {/* Center pagination */}
            {current.total > PAGE_SIZE && (
              <div style={{ marginTop: 20 }}>
                <CustomPagination
                  current={current.page}
                  pageSize={PAGE_SIZE}
                  total={current.total}
                  onChange={(page) => fetchTab(activeTab, page)}
                  layout="center"
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* ══════════════ DETAIL MODAL ══════════════ */}
      <Modal
        title={
          <Space>
            <FileTextOutlined />
            Chi tiết đơn hoàn tiền
            {selectedRefund && (
              <Text type="secondary" style={{ fontSize: 13 }}>
                #{selectedRefund.id}
              </Text>
            )}
            
            {/* Status tag — guard against null while loading */}
            {selectedRefund && (() => {
              const s = REFUND_STATUSES.find((x) => x.code === selectedRefund.status);
              return s ? (
                <Tag color={s.color} icon={s.icon} style={{ marginLeft: 10 }}>{s.label}</Tag>
              ) : (
                <Tag style={{ marginLeft: 10 }}>{selectedRefund.status}</Tag>
              );
            })()}
          </Space>
        }
        open={detailVisible}
        onCancel={() => !processing && setDetailVisible(false)}
        footer={null}
        width={780}
        centered
        destroyOnHidden
        styles={{ body: { padding: "0 24px 28px" } }}
      >
        {detailLoading ? (
          <div style={{ textAlign: "center", padding: "60px 0" }}>
            <Spin size="large" description="Đang tải chi tiết..." />
          </div>
        ) : selectedRefund ? (
          <>

            {/* Customer */}
            <Divider titlePlacement="left" style={{ marginTop: 0 }} styles={{ content: { margin: 0 } }}>
              <Text strong><UserOutlined style={{ marginRight: 6 }} />Thông tin khách hàng</Text>
            </Divider>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 14 }}>
              <Descriptions.Item label={<><UserOutlined /> Họ tên</>}>{selectedRefund.fullName || "N/A"}</Descriptions.Item>
              <Descriptions.Item label={<><MailOutlined /> Email</>}>{selectedRefund.username || "N/A"}</Descriptions.Item>
              <Descriptions.Item label={<><PhoneOutlined /> Điện thoại</>}>{selectedRefund.phone || "N/A"}</Descriptions.Item>
              <Descriptions.Item label={<><EnvironmentOutlined /> Địa chỉ</>}>{selectedRefund.address || "N/A"}</Descriptions.Item>
            </Descriptions>

            {/* Refund info */}
            <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
              <Text strong><DollarOutlined style={{ marginRight: 6 }} />Thông tin hoàn tiền</Text>
            </Divider>
            <Descriptions column={2} size="small" bordered style={{ marginBottom: 14 }}>
              <Descriptions.Item label="Loại hoàn tiền">{getRefundTypeLabel(selectedRefund.code)}</Descriptions.Item>
              <Descriptions.Item label="Số tiền hoàn">
                <Text style={{ color: "#cf1322", fontWeight: 700 }}>
                  {selectedRefund.refundAmount?.toLocaleString()}đ
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="Mã đơn hàng">#{selectedRefund.orderId || "N/A"}</Descriptions.Item>
              <Descriptions.Item label="Ngày giao dịch">
                {selectedRefund.transactionDate ? dayjs(selectedRefund.transactionDate).format("DD/MM/YYYY HH:mm:ss") : "N/A"}
              </Descriptions.Item>
              <Descriptions.Item label="Lý do" span={2}>{selectedRefund.reason || "N/A"}</Descriptions.Item>
            </Descriptions>

            {/* Products */}
            <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
              <Text strong>Danh sách sản phẩm</Text>
            </Divider>
            <div
              className="product-list-scroll"
              style={{ maxHeight: 240, overflowY: "auto", marginBottom: 14 }}
            >
              <Table
                columns={productCols}
                dataSource={selectedRefund.details || []}
                rowKey={(record) => record.productCode || Math.random().toString()}
                pagination={false}
                size="small"
                bordered
                summary={() => (
                  <Table.Summary.Row>
                    <Table.Summary.Cell colSpan={3} align="right">
                      <Text strong>Tổng cộng:</Text>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="right">
                      <Text strong style={{ color: "#cf1322" }}>
                        {selectedRefund.totalPrice?.toLocaleString()}đ
                      </Text>
                    </Table.Summary.Cell>
                  </Table.Summary.Row>
                )}
              />
            </div>

            {/* Note */}
            <Divider titlePlacement="left" styles={{ content: { margin: 0 } }}>
              <Text strong>Ghi chú của admin</Text>
            </Divider>
            <TextArea
              rows={3}
              placeholder="Nhập ghi chú (tuỳ chọn)..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              disabled={selectedRefund.status !== "PENDING" || processing}
              style={{ marginBottom: 20 }}
            />

            {/* Action buttons — only PENDING */}
            {selectedRefund.status === "PENDING" && (
              <Row justify="end" gutter={12}>
                <Col>
                  <MyButton
                    danger
                    icon={<CloseCircleOutlined />}
                    onClick={handleReject}
                    loading={processing}
                  >
                    Từ chối
                  </MyButton>
                </Col>
                <Col>
                  <MyButton
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={handleApprove}
                    loading={processing}
                    style={{ background: "#52c41a", borderColor: "#52c41a" }}
                  >
                    Đồng ý hoàn tiền
                  </MyButton>
                </Col>
              </Row>
            )}
          </>
        ) : null}
      </Modal>
    </div>
  );
}
