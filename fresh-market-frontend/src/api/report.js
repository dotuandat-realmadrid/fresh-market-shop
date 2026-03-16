import { API } from "./auth";
import { getToken } from "../services/localStorageService";

export const revenueByProduct = async (productCode) => {
    try {
        const response = await fetch(`${API}/reports/products/${productCode}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tải báo cáo lợi nhuận thất bại!");
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
