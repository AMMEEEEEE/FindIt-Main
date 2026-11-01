import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { allClaims } from "../data/allClaims";
import { useAuth } from "../context/AuthContext";

export default function AdminNavbar() {
  const [open, setOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();
  const pendingCount = allClaims.filter((c) => c.status === "pending").length;

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <header className="nav">
      <Link to="/admin" className="logo">
        Find<b>It</b> <span className="admin-label">Admin</span>
      </Link>

      <button
        className="menu-btn"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      <nav className={`links ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
        <NavLink to="/admin" end>Dashboard</NavLink>
        <NavLink to="/admin/listings">Listings</NavLink>
        <NavLink to="/admin/claims">
          Claims {pendingCount > 0 && <span className="badge">{pendingCount}</span>}
        </NavLink>
        <NavLink to="/">View site</NavLink>
        <button className="linkbtn" onClick={handleLogout}>Log out</button>
      </nav>
    </header>
  );
}