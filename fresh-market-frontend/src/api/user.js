import { message } from "antd";
import { setUserInfo } from "../reducers/userReducer";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";
import { validateInput } from "../utils/ValidateInputUtil";

export const createUser = async (data) => {
  try {
    const response = await fetch(`${API}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Đăng ký thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Đăng ký thành công!");
    return result.result;
  } catch (error) {
    message.error(error.message);
    throw error;
  }
};

export const createGuest = async (data) => {
  try {
    const response = await fetch(`${API}/users/guests`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Đăng ký thất bại!");
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

export const updateUser = async (data, id) => {
  try {
    const response = await fetch(`${API}/users/${id}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${getToken()}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(validateInput(data)),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Cập nhật thông tin thất bại!");
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Cập nhật tài khoản thành công!");
    return result.result;
  } catch (error) {
    message.error(error.message);
  }
};

export const getMyInfo = (accessToken) => {
  return async (dispatch, getState) => {
    const { user } = getState();
    if (user.id) {
      return;
    }

    try {
      const response = await fetch(`${API}/users/myInfo`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.message || "Tải thông tin người dùng thất bại!"
        );
      }

      const result = await response.json();

      if (result.code !== 1000) {
        throw new Error("get my info");
      }

      // Gọi action để lưu thông tin vào Redux store
      dispatch(setUserInfo(result.result));
    } catch (error) {
      console.error(error.message);
    }
  };
};

export const searchUser = async (request, page, size) => {
  try {
    const params = new URLSearchParams();
    if (request.id) params.append("id", request.id);
    if (request.username) params.append("username", request.username);
    if (request.fullName) params.append("fullName", request.fullName);
    if (request.phone) params.append("phone", request.phone);
    if (request.role) params.append("role", request.role);
    if (request.isGuest !== undefined && request.isGuest !== "") params.append("isGuest", request.isGuest);
    if (request.isDeleted !== undefined) params.append("isDeleted", request.isDeleted);
    
    params.append("page", page || 1);
    params.append("size", size || 5);

    const response = await fetch(
      `${API}/users?${params.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${getToken()}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin người dùng thất bại!"
      );
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

export const deleteUser = async (ids) => {
  try {
    const response = await fetch(`${API}/users/${ids}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Xoá thông tin người dùng thất bại!"
      );
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Xóa tài khoản thành công");
  } catch (error) {
    message.error(error.message);
  }
};

export const restoreUser = async (id) => {
  try {
    const response = await fetch(`${API}/users/${id}/restore`, {
      method: "PATCH", // Or PUT depending on API
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Khôi phục tài khoản thất bại!"
      );
    }

    const result = await response.json();

    if (result.code !== 1000) {
      throw new Error(result.message);
    }

    message.success("Khôi phục tài khoản thành công");
  } catch (error) {
    message.error(error.message);
  }
};

export const getUserById = async (id) => {
  try {
    const response = await fetch(`${API}/users/${id}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || "Tải thông tin người dùng thất bại!"
      );
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
