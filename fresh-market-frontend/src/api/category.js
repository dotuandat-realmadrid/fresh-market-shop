import { API } from "./auth";
import { getToken } from "../services/localStorageService";
import { validateInput } from "../utils/ValidateInputUtil";

export const getAll = async () => {
  try {
    const response = await fetch(`${API}/categories`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải danh mục thất bại!");
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

export const searchCategories = async (page = 1, size = 20) => {
  try {
    const response = await fetch(`${API}/categories/search?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tìm kiếm danh mục thất bại!");
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

export const createCategory = async (data) => {
  try {
    const response = await fetch(`${API}/categories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm danh mục thất bại!");
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

export const updateCategory = async (code, data) => {
  try {
    const response = await fetch(`${API}/categories/${code}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật danh mục thất bại!");
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

export const deleteCategory = async (code) => {
  try {
    const response = await fetch(`${API}/categories/${code}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xoá danh mục thất bại!");
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

export const getAllCategoryCodes = async () => {
  try {
    const response = await fetch(`${API}/categories/codes`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải mã danh mục thất bại!");
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

export const uploadCategoryImage = async (code, file) => {
  try {
    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API}/categories/${code}/image`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải ảnh danh mục thất bại!");
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

export const updateCategoryImage = async (code, newImage, keepImage) => {
  try {
    const formData = new FormData();
    if (newImage) formData.append("newImage", newImage);
    if (keepImage) formData.append("keepImage", keepImage);

    const response = await fetch(`${API}/categories/${code}/image`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật ảnh danh mục thất bại!");
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

export const getCategoryTree = async () => {
  try {
    const response = await fetch(`${API}/categories/tree`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải cây phân cấp danh mục thất bại!");
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

export const getCategoryTreePaged = async (page = 1, size = 10, code = "", name = "") => {
  try {
    let url = `${API}/categories/tree/paged?page=${page}&size=${size}`;
    if (code) url += `&code=${code}`;
    if (name) url += `&name=${name}`;

    const response = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải cây phân cấp danh mục thất bại!");
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
