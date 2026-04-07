import { API } from "./auth";
import { getToken } from "../services/localStorageService";

/**
 * Tìm kiếm danh sách hoàn tiền (Admin)
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Object>} ApiResponse<PageResponse<RefundResponse>>
 */
export const searchRefunds = async (page = 1, size = 10) => {
    const response = await fetch(`${API}/refunds/search?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tải danh sách hoàn tiền!");
    }

    return (await response.json()).result;
};

/**
 * Gửi yêu cầu hoàn tiền (User)
 * @param {Object} refundRequest { orderId, reason, ... }
 * @returns {Promise<Object>} ApiResponse<RefundResponse>
 */
export const createRefund = async (refundRequest) => {
    const response = await fetch(`${API}/refunds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(refundRequest),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gửi yêu cầu hoàn tiền thất bại!");
    }

    return (await response.json());
};

/**
 * Lấy danh sách hoàn tiền theo trạng thái (Admin)
 * @param {string} status PENDING, COMPLETED, REJECTED
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Object>}
 */
export const getRefundsByStatus = async (status, page = 1, size = 10) => {
    const response = await fetch(`${API}/refunds/status/${status}?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tải danh sách hoàn tiền theo trạng thái!");
    }

    return (await response.json()).result;
};

/**
 * Lấy thông tin chi tiết hoàn tiền
 * @param {string} id 
 * @returns {Promise<Object>}
 */
export const getRefundById = async (id) => {
    const response = await fetch(`${API}/refunds/${id}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể lấy thông tin chi tiết hoàn tiền!");
    }

    return (await response.json()).result;
};

/**
 * Lấy danh sách hoàn tiền của User theo trạng thái
 * @param {string} userId
 * @param {string} status
 * @param {number} page
 * @param {number} size
 * @returns {Promise<Object>}
 */
export const getRefundsByUser = async (userId, status, page = 1, size = 10) => {
    const response = await fetch(`${API}/refunds/user/${userId}/status/${status}?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể tải danh sách hoàn tiền của người dùng!");
    }

    return (await response.json()).result;
};

/**
 * Cập nhật trạng thái hoàn tiền (Admin)
 * @param {string} id
 * @param {Object} statusRequest { status, note }
 * @returns {Promise<Object>}
 */
export const updateRefundStatus = async (id, statusRequest) => {
    const response = await fetch(`${API}/refunds/${id}/status`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(statusRequest),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Cập nhật trạng thái hoàn tiền thất bại!");
    }

    return (await response.json()).result;
};

/**
 * Đếm tổng số yêu cầu hoàn tiền đang chờ (Admin)
 * @returns {Promise<number>}
 */
export const countPendingRefunds = async () => {
    const response = await fetch(`${API}/refunds/status/PENDING/count`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Không thể đếm số yêu cầu hoàn tiền đang chờ!");
    }

    return (await response.json()).result;
};
