import { Outlet } from "react-router-dom";
import AdminNavbar from "./AdminNavbar";
import Footer from "./Footer";

export default function AdminLayout() {
  return (
    <div className="app">
      <AdminNavbar />
      <main className="main">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}