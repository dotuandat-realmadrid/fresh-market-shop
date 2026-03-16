import React from 'react';
import { Row, Col, Card, Statistic, Table } from 'antd';
import { 
  ArrowUpOutlined, 
  ArrowDownOutlined, 
  UserOutlined, 
  ShoppingOutlined, 
  DollarOutlined,
  ShoppingCartOutlined
} from '@ant-design/icons';

const HomeAdmin = () => {
  const columns = [
    { title: 'Mã khách hàng', dataIndex: 'customerCode', key: 'customerCode' },
    { title: 'Khách hàng', dataIndex: 'customer', key: 'customer' },
    { title: 'Sản phẩm', dataIndex: 'product', key: 'product' },
    { title: 'Giá', dataIndex: 'price', key: 'price', render: (price) => `${price.toLocaleString()} VNĐ` },
    { title: 'Trạng thái', dataIndex: 'status', key: 'status', render: (status) => (
      <span className={`badge ${status === 'Hoàn thành' ? 'bg-success' : 'bg-warning'}`}>{status}</span>
    )},
  ];

  const data = [
    { key: '1', customerCode: '#2457', customer: 'Nguyễn Văn A', product: 'Dâu Hàn Quốc', price: 159000, status: 'Hoàn thành' },
    { key: '2', customerCode: '#2147', customer: 'Lê Thị B', product: 'Nho đen Nam Phi', price: 89000, status: 'Đang xử lý' },
    { key: '3', customerCode: '#2048', customer: 'Trần Văn C', product: 'Sầu riêng cơm Ri6', price: 119000, status: 'Hoàn thành' },
  ];

  return (
    <div className="admin-dashboard">
      <h3 className="mb-4">Tổng quan hệ thống</h3>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Đơn hàng"
              value={154}
              precision={0}
              styles={{ content: { color: '#3f8600' } }}
              prefix={<ShoppingCartOutlined />}
              suffix={<small className="text-muted ms-2" style={{ fontSize: '14px' }}>(+12%)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Doanh thu"
              value={45850000}
              precision={0}
              styles={{ content: { color: '#cf1322' } }}
              prefix={<DollarOutlined />}
              suffix={<small className="text-muted ms-2" style={{ fontSize: '14px' }}>(-5%)</small>}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Sản phẩm"
              value={1250}
              precision={0}
              prefix={<ShoppingOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card variant="borderless" className="shadow-sm">
            <Statistic
              title="Khách hàng"
              value={856}
              precision={0}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Giao dịch gần đây" className="mt-4 shadow-sm" variant="borderless">
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Card title="Giao dịch gần đây" className="mt-4 shadow-sm" variant="borderless">
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Card title="Giao dịch gần đây" className="mt-4 shadow-sm" variant="borderless">
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>

      <Card title="Giao dịch gần đây" className="mt-4 shadow-sm" variant="borderless">
        <Table columns={columns} dataSource={data} pagination={false} />
      </Card>
    </div>
  );
};

export default HomeAdmin;
