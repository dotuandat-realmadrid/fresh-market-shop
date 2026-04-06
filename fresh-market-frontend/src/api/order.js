import { API } from "./auth";
import { getToken } from "../services/localStorageService";

/**
 * Tìm kiếm đơn hàng (Admin)
 */
export const searchOrders = async (params, page = 1, size = 10) => {
    const queryParams = new URLSearchParams({ ...params, page, size });
    const response = await fetch(`${API}/orders?${queryParams}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Không thể tìm kiếm đơn hàng!");
    }

    return await response.json();
};

/**
 * Tạo đơn hàng mới
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

    return await response.json();
};

/**
 * Tạo đơn hàng tại quầy (Admin)
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
        throw new Error("Tạo đơn hàng tại quầy thất bại!");
    }

    return await response.json();
};

/**
 * Lấy chi tiết đơn hàng của tôi
 */
export const getOneByOrderId = async (orderId) => {
    const response = await fetch(`${API}/orders/me/${orderId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Không thể lấy thông tin đơn hàng!");
    }

    return await response.json();
};

/**
 * Lấy thông tin đơn hàng bất kỳ
 */
export const getOrderById = async (orderId) => {
    const response = await fetch(`${API}/orders/${orderId}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Không thể lấy thông tin đơn hàng!");
    }

    return await response.json();
}

/**
 * Kiểm tra đơn hàng bằng ID và Email (Tra cứu không cần login)
 */
export const getByIdAndEmail = async (id, email) => {
    const response = await fetch(`${API}/orders/check?id=${id}&email=${email}`, {
        method: "GET",
    });

    if (!response.ok) {
        throw new Error("Không thể tìm thấy đơn hàng!");
    }

    return await response.json();
}

/**
 * Xuất hóa đơn PDF
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
}

/**
 * Lấy danh sách đơn hàng theo User và Trạng thái
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

    return await response.json();
};

/**
 * Hủy đơn hàng (User)
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

    return await response.json();
};

/**
 * Cập nhật trạng thái đơn hàng (Admin)
 */
export const updateOrderStatus = async (orderId, status) => {
    const response = await fetch(`${API}/orders/${orderId}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify({ status }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật trạng thái thất bại!");
    }

    return await response.json();
};

/**
 * Đếm số đơn hàng đang chờ xử lý
 */
export const countPendingOrders = async () => {
    const response = await fetch(`${API}/orders/status/PENDING/count`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Không thể đếm số đơn hàng!");
    }

    return await response.json();
};
