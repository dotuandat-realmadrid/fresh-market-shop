import { Routes, Route } from "react-router-dom";
import MainLayout from "../components/layout/MainLayout";
import Home from "../pages/Home/Home";
import Product from "../pages/Home/Product";
import ProductDetail from "../pages/Home/ProductDetail";
import NotFound from "../pages/Home/404NotFound";
import AuthPage from "../pages/Home/AuthPage";
import ScrollToTop from "../components/ScrollToTop";
import AdminLayout from "../components/layout/AdminLayout";
import HomeAdmin from "../pages/Admin/HomeAdmin";
import AccountAdmin from "../pages/Admin/AccountAdmin";
import AccountTrashBinAdmin from "../pages/Admin/AccountTrashBinAdmin";
import AccountDetailAdmin from "../pages/Admin/AccountDetailAdmin";
import DiscountAdmin from "../pages/Admin/DiscountAdmin";
import DiscountTrashBinAdmin from "../pages/Admin/DiscountTrashBinAdmin";
import SupplierAdmin from "../pages/Admin/SupplierAdmin";
import SupplierTrashBinAdmin from "../pages/Admin/SupplierTrashBinAdmin";
import CategoryAdmin from "../pages/Admin/CategoryAdmin";
import CategoryTrashBinAdmin from "../pages/Admin/CategoryTrashBinAdmin";
import ProductAdmin from "../pages/Admin/ProductAdmin";
import ProductTrashBinAdmin from "../pages/Admin/ProductTrashBinAdmin";
import ProductDetailAdmin from "../pages/Admin/ProductDetailAdmin";
import PrivateRoute from "./PrivateRoutes";

const AppRoutes = () => {
    return (
      <>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="/collections/:category" element={<Product />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/login" element={<AuthPage />} />
            <Route path="/register" element={<AuthPage />} />
          </Route>
          <Route path="/admin" element={ 
            <PrivateRoute
              element={<AdminLayout />}
              requiredRoles={[
              "ADMIN",
            ]}/>
          }>
            <Route index element={<HomeAdmin />} />
            <Route path="accounts" element={<AccountAdmin />} />
            <Route path="accounts/:id" element={<AccountDetailAdmin />} />
            <Route path="accounts/trash" element={<AccountTrashBinAdmin />} />
            <Route path="discounts" element={<DiscountAdmin />} />
            <Route path="discounts/trash" element={<DiscountTrashBinAdmin />} />
            <Route path="suppliers" element={<SupplierAdmin />} />
            <Route path="suppliers/trash" element={<SupplierTrashBinAdmin />} />
            <Route path="categories" element={<CategoryAdmin />} />
            <Route path="categories/trash" element={<CategoryTrashBinAdmin />} />
            <Route path="products" element={<ProductAdmin />} />
            <Route path="products/trash" element={<ProductTrashBinAdmin />} />
            <Route path="products/:code" element={<ProductDetailAdmin />} />
          </Route>
          {/* 404 Not Found */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </>
    );
};

export default AppRoutes;
