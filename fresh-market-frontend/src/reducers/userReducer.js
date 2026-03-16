const initialState = {
  id: null,
  username: "",
  fullName: "",
  phone: "",
  dob: null,
  createdDate: null,
  modifiedDate: null,
  isActive: true,
  roles: [],
  hasPassword: true,
};

// action types
const SET_USER_INFO = "SET_USER_INFO";
const GET_USER_INFO = "GET_USER_INFO";
const LOGOUT = "LOGOUT";

// action creator
export const setUserInfo = (userInfo) => ({
  type: SET_USER_INFO,
  payload: userInfo,
});

export const getUserInfo = () => ({
  type: GET_USER_INFO,
});

export const logout = () => {
  return {
    type: "LOGOUT",
  };
};

const userReducer = (state = initialState, action) => {
  switch (action.type) {
    case SET_USER_INFO:
      return { ...state, ...action.payload }; // Cập nhật thông tin user
    case GET_USER_INFO:
      return state; // Không thay đổi state nếu chỉ gọi action GET_USER_INFO
    case LOGOUT:
      return initialState; // Reset toàn bộ state khi logout
    default:
      return state;
  }
};

export default userReducer;
