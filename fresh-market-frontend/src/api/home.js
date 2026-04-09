import { API } from "./auth";
import { getToken } from "../services/localStorageService";

/**
 * Lấy thống kê doanh thu chung (Hôm nay, Tháng này, Năm nay)
 */
export const getSalesStatistics = async () => {
    try {
        const response = await fetch(`${API}/home/sales`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy thống kê doanh thu thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy thống kê chuỗi thời gian (Biểu đồ)
 * @param {string} period "today", "thisMonth", "thisYear"
 */
export const getTimeSeriesStatistics = async (period = "today") => {
    try {
        const response = await fetch(`${API}/home/time-series?period=${period}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy thống kê thời gian thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy doanh thu gần đây
 * @param {string} filter "today", "thisMonth", "thisYear"
 */
export const getRecentRevenue = async (filter = "thisMonth") => {
    try {
        const response = await fetch(`${API}/home/recent-revenue?filter=${filter}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy doanh thu gần đây thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy Top 5 sản phẩm bán chạy
 * @param {string} filter "today", "thisMonth", "thisYear"
 */
export const getTopProducts = async (filter = "today") => {
    try {
        const response = await fetch(`${API}/home/top-products?filter=${filter}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy top sản phẩm thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy các hoạt động gần đây
 * @param {string} filter "today", "thisMonth", "thisYear"
 */
export const getRecentActivities = async (filter = "today") => {
    try {
        const response = await fetch(`${API}/home/recent-activities?filter=${filter}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy hoạt động gần đây thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy sản phẩm sắp hết hàng
 * @param {number} threshold Ngưỡng tồn kho
 */
export const getLowStockProducts = async (threshold = 10) => {
    try {
        const response = await fetch(`${API}/home/low-stock?threshold=${threshold}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy sản phẩm sắp hết hàng thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy phiếu nhập sắp hết hạn
 * @param {string} filter "today", "thismonth", "thisyear"
 */
export const getExpiringReceipts = async (filter = "thismonth") => {
    try {
        const response = await fetch(`${API}/home/expiring-receipts?filter=${filter}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy phiếu nhập sắp hết hạn thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

/**
 * Lấy sản phẩm trong kho sắp hết hạn
 * @param {string} filter "today", "thismonth", "thisyear"
 */
export const getExpiringProducts = async (filter = "thismonth") => {
    try {
        const response = await fetch(`${API}/home/expiring-products?filter=${filter}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy sản phẩm sắp hết hạn thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};
