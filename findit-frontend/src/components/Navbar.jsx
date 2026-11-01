import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="nav">
      <Link to="/" className="logo">Find<b>It</b></Link>

      <button
        className="menu-btn"
        onClick={() => setOpen(!open)}
        aria-label="Toggle menu"
      >
        {open ? "✕" : "☰"}
      </button>

      <nav className={`links ${open ? "open" : ""}`} onClick={() => setOpen(false)}>
        <NavLink to="/" end>Home</NavLink>
        <NavLink to="/report">Report item</NavLink>

        {user ? (
          <>
            {user.role === "admin" && <NavLink to="/admin">Dashboard</NavLink>}
            <NavLink to="/my-reports">My reports</NavLink>
            <NavLink to="/my-claims">My claims</NavLink>
            <button className="linkbtn" onClick={handleLogout}>Log out</button>
          </>
        ) : (
          <>
            <NavLink to="/login">Log in</NavLink>
            <NavLink to="/register">Register</NavLink>
          </>
        )}
      </nav>
    </header>
  );
}