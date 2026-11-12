import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ role }) {
  const { user, ready } = useAuth();

  // Wait until the saved login has been checked, or a refresh
  // would bounce a logged-in user to the login page
  if (!ready) return <p className="wrap">Loading...</p>;

  if (!user) return <Navigate to="/login" replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;

  return <Outlet />;
}