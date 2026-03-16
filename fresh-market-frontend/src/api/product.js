import { API } from "./auth";
import { getToken } from "../services/localStorageService";

export const searchProducts = async (filters, page = 1, size = 10) => {
  try {
    const queryParams = new URLSearchParams({
      page: page,
      size: size,
      ...filters
    }).toString();

    const response = await fetch(`${API}/products?${queryParams}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Tải danh sách sản phẩm thất bại!");
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

export const createProduct = async (productData) => {
    try {
        const response = await fetch(`${API}/products`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Thêm sản phẩm thất bại!");
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

export const updateProduct = async (productId, productData) => {
    try {
        const response = await fetch(`${API}/products/${productId}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getToken()}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(productData),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Cập nhật sản phẩm thất bại!");
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

export const deleteProducts = async (ids) => {
    try {
        const idsString = Array.isArray(ids) ? ids.join(',') : ids;
        const response = await fetch(`${API}/products/${idsString}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Xóa sản phẩm thất bại!");
        }

        const result = await response.json();
        if (result.code !== 1000) {
            throw new Error(result.message);
        }
        return result;
    } catch (error) {
        throw error;
    }
};

export const uploadProductImages = async (productId, files) => {
    try {
        const formData = new FormData();
        files.forEach(file => {
            formData.append('files', file);
        });

        const response = await fetch(`${API}/products/${productId}/images`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tải ảnh lên thất bại!");
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

export const importProductsExcel = async (file, action = 'create') => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        
        const method = action === 'create' ? 'POST' : 'PUT';
        const response = await fetch(`${API}/products/import-excel`, {
            method: method,
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Import Excel thất bại!");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
};

export const importProductsQR = async (source, data, action = 'create') => {
    try {
        const formData = new FormData();
        if (source === 'file') {
            formData.append('file', data);
            formData.append('source', 'file');
        } else {
            formData.append('qrContent', data);
            formData.append('source', 'camera');
        }

        const method = action === 'create' ? 'POST' : 'PUT';
        const response = await fetch(`${API}/products/import-qr`, {
            method: method,
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Import QR thất bại!");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
};

export const importProductsPDF = async (file, action = 'create', sourcePage = 'for-sale') => {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('sourcePage', sourcePage);
        formData.append('action', action);

        const method = action === 'create' ? 'POST' : 'PUT';
        const response = await fetch(`${API}/products/import-pdf`, {
            method: method,
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Import PDF thất bại!");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
};

export const importProductsAI = async (quantity) => {
    try {
        const formData = new FormData();
        formData.append('quantity', quantity);

        const response = await fetch(`${API}/products/import-ai`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tạo sản phẩm bằng AI thất bại!");
        }

        const result = await response.json();
        return result;
    } catch (error) {
        throw error;
    }
};
export const getProductByCode = async (code) => {
    try {
        const response = await fetch(`${API}/products/${code}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tải chi tiết sản phẩm thất bại!");
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

export const deleteProduct = async (productId) => {
    try {
        const response = await fetch(`${API}/products/${productId}`, {
            method: "DELETE",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Xóa sản phẩm thất bại!");
        }

        const result = await response.json();
        if (result.code !== 1000) {
            throw new Error(result.message);
        }
        return result;
    } catch (error) {
        throw error;
    }
};

export const updateProductImages = async (productId, keepImages, files) => {
    try {
        const formData = new FormData();
        
        // Append keepImages individually or as multiple fields
        if (keepImages && keepImages.length > 0) {
            keepImages.forEach(img => {
                formData.append('keepImages', img);
            });
        }
        
        // Append new files as 'newImages' to match backend @RequestParam
        if (files && files.length > 0) {
            files.forEach(file => {
                formData.append('newImages', file);
            });
        }

        const response = await fetch(`${API}/products/${productId}/images`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
            body: formData,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Cập nhật ảnh thất bại!");
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

export const getTrashBinProducts = async (page = 1, size = 5) => {
    try {
        const response = await fetch(`${API}/products/trash?page=${page}&size=${size}`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Tải thùng rác thất bại!");
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

export const restoreProducts = async (ids) => {
    try {
        const idsString = Array.isArray(ids) ? ids.join(',') : ids;
        const response = await fetch(`${API}/products/restore/${idsString}`, {
            method: "PUT",
            headers: {
                Authorization: `Bearer ${getToken()}`,
            },
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Khôi phục sản phẩm thất bại!");
        }

        const result = await response.json();
        if (result.code !== 1000) {
            throw new Error(result.message);
        }
        return result;
    } catch (error) {
        throw error;
    }
};
