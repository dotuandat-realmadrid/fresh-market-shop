import { message } from "antd";
import { getToken } from "../services/localStorageService";
import { API } from "./auth";

export const getWishListByUser = async (userId, page, size) => {
  try {
    const response = await fetch(`${API}/wish-list/${userId}?page=${page}&size=${size}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Tải thất bại!");
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

export const toggleWishlist = async (userId, productId) => {
  try {
    const response = await fetch(`${API}/wish-list/${userId}/${productId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${getToken()}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Thất bại!");
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

