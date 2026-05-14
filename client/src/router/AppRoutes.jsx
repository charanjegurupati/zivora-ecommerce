import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import { PageLoader } from "../components/common/PageLoader.jsx";
import { Layout } from "../components/layout/Layout.jsx";
import { AdminRoute } from "./AdminRoute.jsx";
import { ProtectedRoute } from "./ProtectedRoute.jsx";

const HomePage = lazy(() => import("../pages/HomePage.jsx"));
const ProductsPage = lazy(() => import("../pages/ProductsPage.jsx"));
const ProductDetailPage = lazy(() => import("../pages/ProductDetailPage.jsx"));
const CartPage = lazy(() => import("../pages/CartPage.jsx"));
const CheckoutPage = lazy(() => import("../pages/CheckoutPage.jsx"));
const AuthPage = lazy(() => import("../pages/AuthPage.jsx"));
const VerifyEmailPage = lazy(() => import("../pages/VerifyEmailPage.jsx"));
const ResetPasswordPage = lazy(() => import("../pages/ResetPasswordPage.jsx"));
const DashboardPage = lazy(() => import("../pages/DashboardPage.jsx"));
const AdminPage = lazy(() => import("../pages/AdminPage.jsx"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage.jsx"));

export const AppRoutes = () => (
  <Suspense fallback={<PageLoader label="Building your storefront..." />}>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="products" element={<ProductsPage />} />
        <Route path="products/:slug" element={<ProductDetailPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="auth" element={<AuthPage />} />
        <Route path="verify-email" element={<VerifyEmailPage />} />
        <Route path="reset-password" element={<ResetPasswordPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path="dashboard" element={<DashboardPage />} />

          <Route element={<AdminRoute />}>
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  </Suspense>
);
