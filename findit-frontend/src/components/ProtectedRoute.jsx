import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

// Wrap pages with this to lock them.
// <ProtectedRoute />            = any logged-in user
// <ProtectedRoute role="admin" /> = admins only
export default function ProtectedRoute({ role }) {
  const { user } = useAuth();

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
}