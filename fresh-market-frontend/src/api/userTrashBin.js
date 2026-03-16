import { API } from "./auth";
import { getToken } from "../services/localStorageService";
import { message } from "antd";

export const searchUserTrash = async (page, size) => {
  try {
    const params = new URLSearchParams();
    params.append("page", page || 1);
    params.append("size", size || 10);

    const response = await fetch(`${API}/users/trash?${params.toString()}`, {
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
    message.error(error.message);
    throw error;
  }
};

export const restoreUsers = async (ids) => {
  try {
    // ids can be a single string or an array of strings
    const idList = Array.isArray(ids) ? ids.join(",") : ids;
    const response = await fetch(`${API}/users/restore/${idList}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Khôi phục tài khoản thất bại!");
    }

    const result = await response.json();
    if (result.code !== 1000 && result.code !== undefined) {
      throw new Error(result.message);
    }

    message.success(result.message || "Khôi phục tài khoản thành công");
    return result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};
