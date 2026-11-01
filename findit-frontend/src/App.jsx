import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout";
import AdminLayout from "./components/AdminLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ReportItem from "./pages/ReportItem";
import ItemDetails from "./pages/ItemDetails";
import MyReports from "./pages/MyReports";
import MyClaims from "./pages/MyClaims";
import Dashboard from "./pages/Dashboard";
import AdminListings from "./pages/AdminListings";
import AdminClaims from "./pages/AdminClaims";
import ForgotPassword from "./pages/ForgotPassword";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* Anyone can open these */}
        <Route path="*" element={<NotFound />} />
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/items/:id" element={<ItemDetails />} />

        {/* Logged-in users only */}
        <Route element={<ProtectedRoute />}>
          <Route path="/report" element={<ReportItem />} />
          <Route path="/my-reports" element={<MyReports />} />
          <Route path="/my-claims" element={<MyClaims />} />
        </Route>
      </Route>

      {/* Admins only */}
      <Route element={<ProtectedRoute role="admin" />}>
        <Route element={<AdminLayout />}>
          <Route path="/admin" element={<Dashboard />} />
          <Route path="/admin/listings" element={<AdminListings />} />
          <Route path="/admin/claims" element={<AdminClaims />} />
        </Route>
      </Route>
    </Routes>
  );
}