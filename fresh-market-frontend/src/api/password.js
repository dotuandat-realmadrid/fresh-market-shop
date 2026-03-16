import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";

export const setPassword = async (body) => {
  try {
    const response = await fetch(`${API}/password/set`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Đặt mật khẩu thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Đặt mật khẩu thành công");
    window.location.reload();
  } catch (error) {
    message.error(error.message);
  }
};

export const changePassword = async (body) => {
  try {
    const response = await fetch(`${API}/password/change`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thay đổi mật khẩu thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Thay đổi mật khẩu thành công");
  } catch (error) {
    message.error(error.message);
  }
};

export const resetPassword = async (id) => {
  try {
    const response = await fetch(`${API}/password/reset/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Reset mật khẩu thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Đã đặt lại mật khẩu mặc định: 12345678");
  } catch (error) {
    message.error(error.message);
  }
};
