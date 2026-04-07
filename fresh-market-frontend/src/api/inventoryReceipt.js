import { API } from "./auth";
import { getToken } from "../services/localStorageService";

export const searchInventory = async (filters, page = 1, size = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page: page,
      size: size,
      ...filters
    }).toString();

    const response = await fetch(`${API}/inventory-receipts?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Tải danh sách phiếu nhập thất bại!");
    }

    const result = await response.json();
    return result.result;
  } catch (error) {
    throw error;
  }
};

export const getInventoryReceipts = async (status, page = 1, size = 10) => {
    try {
        const response = await fetch(`${API}/inventory-receipts/status/${status}?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tải danh sách phiếu nhập theo trạng thái thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

export const getInventoryReceiptById = async (id) => {
    try {
        const response = await fetch(`${API}/inventory-receipts/${id}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tải thông tin phiếu nhập thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

export const createInventoryReceipt = async (data) => {
    try {
        const response = await fetch(`${API}/inventory-receipts`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tạo phiếu nhập thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

export const updateInventoryReceipt = async (id, data) => {
    try {
        const response = await fetch(`${API}/inventory-receipts/${id}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Cập nhật phiếu nhập thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

export const updateInventoryReceiptStatus = async (id, data) => { // Backend dùng PatchMapping và nhận object { status }
    try {
        const response = await fetch(`${API}/inventory-receipts/${id}/status`, {
            method: "PATCH",
            headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(data), // record code uses data directly (e.g. { status: newStatus })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Cập nhật trạng thái phiếu nhập thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

export const countTotalPendingReceipts = async () => {
    try {
        const response = await fetch(`${API}/inventory-receipts/status/PENDING/count`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Lấy số lượng phiếu nhập đang chờ thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};

export const importInventoryExcel = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await fetch(`${API}/inventory-receipts/import-excel`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Import Excel phiếu nhập thất bại!");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const importInventoryQR = async (source, data) => {
    try {
        const formData = new FormData();
        if (source === 'file') {
            formData.append('file', data);
            formData.append('source', 'file');
        } else {
            formData.append('qrContent', data);
            formData.append('source', 'camera');
        }

        const response = await fetch(`${API}/inventory-receipts/import-qr`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Import QR phiếu nhập thất bại!");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const importInventoryPDF = async (file) => {
    try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API}/inventory-receipts/import-pdf`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Import PDF phiếu nhập thất bại!");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const importInventoryAI = async (quantity) => {
    try {
        const formData = new FormData();
        formData.append('quantity', quantity);

        const response = await fetch(`${API}/inventory-receipts/import-ai`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tạo phiếu nhập bằng AI thất bại!");
        }

        return await response.json();
    } catch (error) {
        throw error;
    }
};

export const getInventoryReceiptDetailByProductId = async (productId, page = 1, size = 5) => {
    try {
        const response = await fetch(`${API}/inventory-receipt-details?productId=${productId}&page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tải chi tiết phiếu nhập theo sản phẩm thất bại!");
        }

        const result = await response.json();
        return result.result;
    } catch (error) {
        throw error;
    }
};
