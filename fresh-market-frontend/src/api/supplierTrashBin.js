import { message } from "antd";
import { API } from "./auth";
import { getToken } from "../services/localStorageService";

export const getSupplierTrash = async (page = 1, size = 10) => {
  try {
    const response = await fetch(`${API}/suppliers/trash?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải dữ liệu thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    return result.result;
  } catch (error) {
    message.error(error.message);
    return null;
  }
};

export const restoreSuppliers = async (ids) => {
  try {
    const idsArray = Array.isArray(ids) ? ids : [ids];
    const response = await fetch(`${API}/suppliers/restore/${idsArray.join(",")}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Khôi phục thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Khôi phục thành công");
    return true;
  } catch (error) {
    message.error(error.message);
    return false;
  }
};
