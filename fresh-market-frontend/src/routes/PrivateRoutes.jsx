import { Navigate } from "react-router-dom";
import { getToken } from "../services/localStorageService";
import { useEffect, useState } from "react";
import { introspect } from "../api/auth";
import { message, Space, Spin, Typography } from "antd";
import { hasPermission } from "../services/authService";

const PrivateRoute = ({ element, requiredRoles }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(false);
  const [hasAuth, setHasAuth] = useState(false);

  useEffect(() => {
    const isValidToken = async () => {
      const token = getToken();
      if (token) {
        try {
          const valid = await introspect(token);
          setIsLogin(valid === true);
          if (valid) {
            const auth = hasPermission(requiredRoles);
            setHasAuth(auth);
            if (!auth) message.error("Bạn không được ủy quyền!");
          } else {
            message.error("Vui lòng đăng nhập!");
          }
        } catch (error) {
          console.error("lỗi ở private route:", error);
          setIsLogin(false);
          setHasAuth(false);
          message.error("Vui lòng đăng nhập!");
        }
      } else {
        setIsLogin(false);
        setHasAuth(false);
        message.warning("Vui lòng đăng nhập!");
      }

      setIsLoading(false);
    };

    isValidToken();
  }, [requiredRoles]);

  if (isLoading) {
    return (
      <Space
        orientation="vertical"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <Spin size="large" />
        <Typography>Loading ...</Typography>
      </Space>
    );
  }

  if (!isLogin) {
    return <Navigate to="/login" replace />;
  }

  if (!hasAuth) {
    return <Navigate to="/" replace />;
  }

  return element;
};

export default PrivateRoute;