import { API } from "./auth";
import { getToken } from "../services/localStorageService";

/**
 * Gửi yêu cầu hoàn tiền
 * @param {Object} refundData { code, userId, orderId, refundAmount, reason, note }
 * @returns {Promise<Object>} ApiResponse
 */
export const createRefund = async (refundData) => {
    const response = await fetch(`${API}/refunds`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(refundData),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Gửi yêu cầu hoàn tiền thất bại!");
    }

    return await response.json();
};

/**
 * Lấy danh sách hoàn tiền (Admin)
 */
export const getRefunds = async (page = 1, size = 10) => {
    const response = await fetch(`${API}/refunds?page=${page}&size=${size}`, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${getToken()}`,
        },
    });

    if (!response.ok) {
        throw new Error("Không thể tải danh sách hoàn tiền!");
    }

    return await response.json();
};
