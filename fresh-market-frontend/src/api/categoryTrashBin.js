import { API } from "./auth";
import { getToken } from "../services/localStorageService";

export const searchTrashBin = async (page = 1, size = 5) => {
  try {
    const response = await fetch(`${API}/categories/trash?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải thùng rác danh mục thất bại!");
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

export const restoreTrashBin = async (ids) => {
  try {
    const idsString = Array.isArray(ids) ? ids.join(',') : ids;
    const response = await fetch(`${API}/categories/restore/${idsString}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Khôi phục danh mục thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    return true;
  } catch (error) {
    throw error;
  }
};
