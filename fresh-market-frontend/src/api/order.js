import { API } from "./auth";
import { getToken } from "../services/localStorageService";

/**
 * Lấy tất cả đơn hàng theo trạng thái (Admin)
 */
export const getAllOrder = async (status, page = 1, size = 10) => {
  const response = await fetch(`${API}/orders/status/${status}?page=${page}&size=${size}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách đơn hàng!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Tìm kiếm đơn hàng (Admin)
 * Endpoint: GET /orders
 */
export const searchOrder = async (params, page = 1, size = 10) => {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      queryParams.append(key, value);
    }
  });
  queryParams.append("page", page);
  queryParams.append("size", size);

  const response = await fetch(`${API}/orders?${queryParams}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tìm kiếm đơn hàng!");
  }

  const result = await response.json();
  return result.result; // Trả về nội dung kết quả từ ApiResponse
};

/**
 * Tạo đơn hàng mới (User)
 * Endpoint: POST /orders
 */
export const createOrder = async (orderData) => {
  const response = await fetch(`${API}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Tạo đơn hàng thất bại!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Tạo đơn hàng tại quầy (Admin)
 * Endpoint: POST /orders/in-store
 */
export const createInStoreOrder = async (orderData) => {
  const response = await fetch(`${API}/orders/in-store`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(orderData),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Tạo đơn hàng tại quầy thất bại!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Lấy chi tiết đơn hàng (Của tôi hoặc Admin có quyền)
 * Endpoint: GET /orders/me/{id}
 */
export const getOneByOrderId = async (orderId) => {
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API}/orders/me/${orderId}`, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông tin đơn hàng!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Lấy chi tiết đơn hàng bất kỳ (Admin)
 * Endpoint: GET /orders/{id}
 */
export const getOrderById = async (orderId) => {
  const token = getToken();
  const headers = {};
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const response = await fetch(`${API}/orders/${orderId}`, {
    method: "GET",
    headers: headers,
  });

  if (!response.ok) {
    throw new Error("Không thể lấy thông tin đơn hàng!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Kiểm tra đơn hàng bằng ID và Email (Guest lookup)
 * Endpoint: GET /orders/check
 */
export const getByIdAndEmail = async (id, email) => {
  const response = await fetch(`${API}/orders/check?id=${id}&email=${email}`, {
    method: "GET",
  });

  if (!response.ok) {
    throw new Error("Không thể tìm thấy đơn hàng!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Lấy danh sách đơn hàng theo User và Trạng thái
 * Endpoint: GET /orders/user/{userId}/status/{status}
 */
export const getOrdersByUser = async (userId, status, page = 1, size = 10) => {
  const response = await fetch(`${API}/orders/user/${userId}/status/${status}?page=${page}&size=${size}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể tải danh sách đơn hàng!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Hủy đơn hàng
 * Endpoint: PATCH /orders/{id}/cancel
 */
export const cancelOrder = async (orderId) => {
  const response = await fetch(`${API}/orders/${orderId}/cancel`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Hủy đơn hàng thất bại!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Cập nhật trạng thái đơn hàng (Admin)
 * Endpoint: PATCH /orders/{id}/status
 */
export const updateOrderStatus = async (orderId, data) => {
  const response = await fetch(`${API}/orders/${orderId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getToken()}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.message || "Cập nhật trạng thái thất bại!");
  }

  const result = await response.json();
  if (result.code !== 1000) {
    throw new Error(result.message || "Lỗi hệ thống!");
  }
  return result.result;
};

/**
 * Đếm số đơn hàng đang chờ xử lý
 * Endpoint: GET /orders/status/PENDING/count
 */
export const countTotalPendingOrders = async () => {
  const response = await fetch(`${API}/orders/status/PENDING/count`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (!response.ok) {
    throw new Error("Không thể đếm số đơn hàng!");
  }

  const result = await response.json();
  return result.result;
};

/**
 * Xuất hóa đơn PDF
 * Endpoint: GET /orders/{id}/invoice/pdf
 */
export const exportInvoicePdf = async (orderId) => {
  const token = getToken();
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API}/orders/${orderId}/invoice/pdf`, {
    method: "GET",
    headers: headers
  });

  if (!response.ok) {
    throw new Error("Không thể xuất hóa đơn!");
  }

  return await response.blob();
};
