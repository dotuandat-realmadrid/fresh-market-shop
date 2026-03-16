import { message } from "antd";
import { API } from "./auth";
import { getToken } from "../services/localStorageService";
import { validateInput } from "../utils/ValidateInputUtil";

export const getAll = async () => {
  try {
    const response = await fetch(`${API}/suppliers`, {
      method: "GET",
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải nhà cung cấp thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    return result.result;
  } catch (error) {
    message.error(error.message);
  }
};

export const createSupplier = async (data) => {
  try {
    const response = await fetch(`${API}/suppliers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm nhà cung cấp thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    window.location.reload();
    message.success("Thêm mới nhà cung cấp thành công");
    return result.result;
  } catch (error) {
    message.error(error.message);
  }
};

export const updateSupplier = async (code, data) => {
  try {
    const response = await fetch(`${API}/suppliers/${code}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật nhà cung cấp thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Cập nhật nhà cung cấp thành công");
    return result.result;
  } catch (error) {
    message.error(error.message);
  }
};

export const deleteSupplier = async (id) => {
  try {
    const response = await fetch(`${API}/suppliers/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xoá nhà cung cấp thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Xóa nhà cung cấp thành công");
  } catch (error) {
    message.error(error.message);
  }
};
