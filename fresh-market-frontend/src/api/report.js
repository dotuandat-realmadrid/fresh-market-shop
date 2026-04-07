import { API } from "./auth";
import { getToken } from "../services/localStorageService";

const fetchReportData = async (endpoint, errorMessage = "Tải báo cáo thất bại!") => {
    try {
        const response = await fetch(`${API}${endpoint}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                // Ignore json parse error if the response is not json
            }
            throw new Error((errorData && errorData.message) || errorMessage);
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

export const getOrderSummary = () => {
    return fetchReportData('/reports/order-summary', 'Tải báo cáo đơn hàng thất bại!');
};

export const getMonthlyRevenueTrend = () => {
    return fetchReportData('/reports/weekly-trend', 'Tải xu hướng doanh thu thất bại!');
};

export const getRevenueByOrderType = () => {
    return fetchReportData('/reports/order-type', 'Tải tỷ trọng đơn hàng thất bại!');
};

export const getCategoryReport = () => {
    return fetchReportData('/reports/category-report', 'Tải doanh thu theo danh mục thất bại!');
};

export const getSupplierReport = () => {
    return fetchReportData('/reports/supplier-report', 'Tải doanh thu theo nhà cung cấp thất bại!');
};

export const getUserGrowth = () => {
    return fetchReportData('/reports/user-growth', 'Tải báo cáo tăng trưởng người dùng thất bại!');
};

export const getTop5ProductsByRevenue = () => {
    return fetchReportData('/reports/products/top-revenue', 'Tải danh sách sản phẩm doanh thu cao thất bại!');
};

export const getBottom5ProductsByRevenue = () => {
    return fetchReportData('/reports/products/lowest-revenue', 'Tải danh sách sản phẩm doanh thu thấp thất bại!');
};

export const getRevenueByProduct = (productCode) => {
    return fetchReportData(`/reports/products/${productCode}`, 'Tải báo cáo lợi nhuận của sản phẩm thất bại!');
};

// Giữ lại tên hàm cũ để tương thích với những component đã lỡ import tên này
export const revenueByProduct = getRevenueByProduct;
