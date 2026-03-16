import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

export const getAddressesByUserId = async (userId) => {
  try {
    const response = await fetch(`${API}/addresses?userId=${userId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải thông tin địa chỉ thất bại!");
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

export const createAddress = async (data) => {
  try {
    const response = await fetch(`${API}/addresses`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thêm địa chỉ thất bại!");
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

export const updateAddress = async (addressId, data) => {
  try {
    const response = await fetch(`${API}/addresses/${addressId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật địa chỉ thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Cập nhật địa chỉ thành công");
    return result.result;
  } catch (error) {
    message.error(error.message);
  }
};

export const deleteAddress = async (addressId) => {
  try {
    const response = await fetch(`${API}/addresses/${addressId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Xoá địa chỉ thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Xóa địa chỉ thành công");
  } catch (error) {
    message.error(error.message);
  }
};
