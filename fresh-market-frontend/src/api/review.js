import { API } from "./auth";
import { getToken } from "../services/localStorageService";

/**
 * Gửi đánh giá mới cho sản phẩm
 * @param {Object} reviewData { userId, productId, orderId, rating, comment }
 * @returns {Promise<Object>} ReviewResponse
 */
export const createReview = async (reviewData) => {
    try {
        const headers = {
            "Content-Type": "application/json",
        };

        const response = await fetch(`${API}/reviews`, {
            method: "POST",
            headers: headers,
            body: JSON.stringify(reviewData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Gửi đánh giá thất bại!");
        }

        const result = await response.json();
        if (result.code !== 1000) {
            throw new Error(result.message);
        }
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy danh sách đánh giá của sản phẩm theo productId
 * @param {string} productId ID của sản phẩm
 * @param {number} page Trang hiện tại (mặc định 1)
 * @param {number} size Số lượng đánh giá mỗi trang (mặc định 10)
 * @returns {Promise<Object>} PageResponse<ReviewResponse>
 */
export const getReviewsByProductId = async (productId, page = 1, size = 10) => {
    try {
        const response = await fetch(`${API}/reviews/product/${productId}?page=${page}&size=${size}`, {
            method: "GET",
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tải danh sách đánh giá thất bại!");
        }

        const result = await response.json();
        if (result.code !== 1000) {
            throw new Error(result.message);
        }
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Xóa đánh giá (Dành cho Admin)
 * @param {string} id ID của đánh giá
 * @returns {Promise<void>}
 */
export const deleteReview = async (id) => {
    try {
        const token = getToken();
        const headers = {};
        if (token) {
            headers["Authorization"] = `Bearer ${token}`;
        }

        const response = await fetch(`${API}/reviews/${id}`, {
            method: "DELETE",
            headers: headers,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Xóa đánh giá thất bại!");
        }

        const result = await response.json();
        if (result.code !== 1000) {
            throw new Error(result.message);
        }
    } catch (error) {
        throw error;
    }
};
