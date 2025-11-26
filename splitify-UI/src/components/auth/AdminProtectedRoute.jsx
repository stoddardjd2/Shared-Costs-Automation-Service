import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminProtectedRoute() {
  const { role, loading, isValidToken } = useAuth();

  // Still checking token → show a simple loader / skeleton
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-sm text-gray-500">Checking permissions…</div>
      </div>
    );
  }

  // No valid token → send to login
  if (!isValidToken) {
    return <Navigate to="/login" replace />;
  }

  // Logged in but not admin → unauthorized
  if (role !== "admin") {
    return <Navigate to="/unauthorized" replace />;
  }

  // All good → render nested admin routes
  return <Outlet />;
}
