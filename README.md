# 🥬 Fresh Market - Hệ thống Thương mại điện tử Thực phẩm sạch

Chào mừng bạn đến với dự án **Fresh Market**! Đây là một hệ thống E-commerce hoàn chỉnh (Fullstack) chuyên về thực phẩm sạch và trái cây nhập khẩu, được phát triển như một đồ án Khóa luận tốt nghiệp.

Dự án bao gồm hai phần chính:
1.  **[Backend](./fresh-market-backend)**: Xây dựng bằng Spring Boot.
2.  **[Frontend](./fresh-market-frontend)**: Xây dựng bằng React & Vite.

---

## 🏛️ Kiến trúc hệ thống

Dự án được tổ chức theo mô hình Client-Server hiện đại:
- **Client Side:** Single Page Application (SPA) phản hồi nhanh, giao diện hiện đại.
- **Server Side:** RESTful API bảo mật, xử lý logic nghiệp vụ và tích hợp các dịch vụ bên thứ ba (AI, Thanh toán).

### 🖥️ Công nghệ Frontend
- **Framework:** React 19 + Vite (tốc độ build cực nhanh).
- **UI Library:** Ant Design (antd) chuyên nghiệp, Bootstrap hỗ trợ layout.
- **State Management:** Redux Toolkit (@reduxjs/toolkit) & Redux Persist.
- **Charts:** ApexCharts, Recharts (Cho bảng điều khiển thống kê).
- **Real-time:** StompJS kết nối WebSocket.
- **Styling:** Vanilla CSS, Styled-components.

### ⚙️ Công nghệ Backend
- **Core:** Spring Boot 3.3.6 (Java 21).
- **Database:** MySQL 8.0, Spring Data JPA.
- **Security:** Spring Security, JWT (Json Web Token), Phân quyền Role-based.
- **Communication:** WebClient, OpenFeign, WebSocket.
- **AI Integration:** Google Gemini AI Integration.
- **Payment:** VNPay Payment Gateway.
- **Storage:** Hệ thống quản lý tệp tin local (uploads).

---

## ✨ Tính năng nổi bật

- **Quản lý Đa vai trò:** Phân biệt rõ quyền hạn giữa Admin (Quản lý kho, đơn hàng, thống kê) và User (Mua hàng, theo dõi đơn).
- **Trải nghiệm Mua sắm mượt mà:** Giỏ hàng thông minh, tìm kiếm theo danh mục và nhà cung cấp.
- **Thanh toán tích hợp:** Hỗ trợ thanh toán trực tuyến qua ví VNPay.
- **Chatbot AI Thông minh:** Tích hợp Gemini AI tư vấn khách hàng tự động ngay trên ứng dụng.
- **Thống kê chuyên sâu:** Dashboard trực quan với các biểu đồ về doanh thu, số lượng đơn hàng và sản phẩm bán chạy.
- **Hệ thống Thông báo:** Cập nhật trạng thái đơn hàng real-time qua thông báo đẩy.
- **Xuất dữ liệu:** Hỗ trợ xuất hóa đơn PDF và báo cáo kho hàng Excel.

---

## 🚀 Hướng dẫn khởi chạy nhanh

### 1. Chuẩn bị
- Cài đặt **Java 21**, **Maven 3.x**.
- Cài đặt **Node.js** (phiên bản 18 trở lên).
- Cài đặt **MySQL 8.x**.

### 2. Khởi chạy Backend
```bash
cd fresh-market-backend
# Tạo file .env và cấu hình DB_URL, DB_USERNAME, DB_PASSWORD...
mvn clean install
mvn spring-boot:run
```
*Backend chạy tại:* `http://localhost:8088/fresh-market`

### 3. Khởi chạy Frontend
```bash
cd fresh-market-frontend
# Cài đặt dependencies
npm install
# Chạy ở chế độ development
npm run dev
```
*Frontend chạy tại:* `http://localhost:3001` (mặc định của Vite).

---

## 🏗️ Docker (Tùy chọn)

Dự án đã có sẵn Dockerfile trong cả hai thư mục để hỗ trợ triển khai bằng Docker Container:
- **Backend:** `docker build -t fresh-market-backend ./fresh-market-backend`
- **Frontend:** `docker build -t fresh-market-frontend ./fresh-market-frontend`

---

## 👨‍💻 Tác giả

- **Đỗ Tuấn Đạt** - Đồ án Khóa luận tốt nghiệp (KLTN).

---
*Chúc bạn có trải nghiệm tuyệt vời với dự án Fresh Market!*
