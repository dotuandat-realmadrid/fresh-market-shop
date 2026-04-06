import { API } from "./auth";
import { getToken } from "../services/localStorageService";

/**
 * Khởi tạo thanh toán VNPay
 * @param {Object} paymentData { amount, bankCode, language, orderData (string) }
 * @returns {Object} { code, message, result (paymentUrl) }
 */
export const initiateVNPay = async (paymentData) => {
    const params = new URLSearchParams();
    params.append('amount', paymentData.amount);
    params.append('bankCode', paymentData.bankCode || '');
    params.append('language', paymentData.language || 'vn');
    params.append('orderData', paymentData.orderData);
    params.append('redirectTo', paymentData.redirectTo);

    const response = await fetch(`${API}/payment/vnpay/pay`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Khởi tạo thanh toán VNPay thất bại!");
    }

    return await response.json();
};

/**
 * Hoàn tiền VNPay
 * @param {Object} params { trantype, order_id, amount, trans_date, user }
 */
export const refundVNPay = async (refundData) => {
    const params = new URLSearchParams();
    params.append('trantype', refundData.trantype);
    params.append('order_id', refundData.order_id);
    params.append('amount', refundData.amount);
    params.append('trans_date', refundData.trans_date);
    params.append('user', refundData.user);

    const response = await fetch(`${API}/payment/vnpay/refund`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${getToken()}`,
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Hoàn tiền VNPay thất bại!");
    }

    return await response.json();
};

/**
 * Kiểm tra kết quả giao dịch VNPay
 * @param {Object} queryData { order_id, trans_date }
 */
export const queryVNPay = async (queryData) => {
    const params = new URLSearchParams();
    params.append('order_id', queryData.order_id);
    params.append('trans_date', queryData.trans_date);

    const response = await fetch(`${API}/payment/vnpay/query`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: `Bearer ${getToken()}`,
        },
        body: params.toString(),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Truy vấn VNPay thất bại!");
    }

    return await response.json();
};
