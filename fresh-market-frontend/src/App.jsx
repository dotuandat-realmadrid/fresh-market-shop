import AppRoutes from './routes/AppRoutes';
import './App.css';
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { introspect, refresh } from "./api/auth";
import { getMyInfo } from "./api/user";
import { getToken } from "./services/localStorageService";
import { RoleProvider } from './context/RoleContext';
import { SupplierProvider } from './context/SupplierContext';
import { CategoryProvider } from './context/CategoryContext';

function App() {
  
  const token = getToken();
  const dispatch = useDispatch();
  
  useEffect(() => {
    const refreshToken = async (token) => {
      const isValidAccessToken = await introspect(token);

      if (!isValidAccessToken) {
        await refresh(token);
      }

      // Lấy thông tin user sau khi xác thực token
      dispatch(getMyInfo(token));
    };

    if (token) {
      refreshToken(token);
    }
  }, [token, dispatch]);
  return (
    <RoleProvider>
      <SupplierProvider>
        <CategoryProvider>
          <AppRoutes />
        </CategoryProvider>
      </SupplierProvider>
    </RoleProvider>
  );
}

export default App;
