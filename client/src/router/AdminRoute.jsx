import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { PageLoader } from "../components/common/PageLoader.jsx";

export const AdminRoute = () => {
  const { user, loading } = useAuth();

  if (loading) {
    return <PageLoader label="Loading admin console..." />;
  }

  if (user?.role !== "admin") {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};
