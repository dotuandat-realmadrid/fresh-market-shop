import {
  getToken,
  removeToken,
  setToken,
} from "../services/localStorageService";
import { message } from "antd";
import { persistor } from "../store/store";
import { getMyInfo } from "./user";

export const API = `http://localhost:8088/fresh-market`;
export const IMAGE_URL = `http://localhost:3001/src/assets/uploads`;
export const DEFAULT_IMAGE = "http://localhost:3001/src/assets/images/no_image_large.jpg";

export const login = async (data, navigate, dispatch) => {
  await fetch(`${API}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then(async (result) => {
      if (result.code !== 1000)
        throw new Error("Email hoặc mật khẩu không chính xác");

      const token = result.result?.token;
      setToken(token);

      // Lấy thông tin người dùng trước khi chuyển hướng
      await dispatch(getMyInfo(token));

      // Chuyển hướng sau khi lấy thông tin người dùng
      navigate("/");
    })
    .catch((error) => {
      message.error(error.message);
    });
};

const LOGOUT = "LOGOUT";

export const logout = () => {
  return async (dispatch) => {
    const data = {
      token: getToken(),
    };

    try {
      const response = await fetch(`${API}/auth/logout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${data.token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Logout failed!");
      }

      // Xóa token và reset store
      removeToken();
      persistor.purge(); // Dọn dẹp persisted state nếu cần
      dispatch({ type: LOGOUT }); // Dispatch action LOGOUT để reset trạng thái người dùng
    } catch (error) {
      // message.error(error.message); // Hiển thị thông báo lỗi
    }
  };
};

export const introspect = async (token) => {
  const data = {
    token: token,
  };
  return await fetch(`${API}/auth/introspect`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.code !== 1000) throw new Error(result.message);

      return result.result?.valid;
    })
    .catch((error) => {
      // message.error(error.message);
      return false;
    });
};

export const refresh = async (token) => {
  const data = { token: token };
  return await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: {
      // Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .then((result) => {
      if (result.code !== 1000) {
        removeToken();
        // throw new Error(result.message);
      }

      setToken(result.result?.token);
    })
    .catch(() => {
      removeToken();
      return;
    });
};
