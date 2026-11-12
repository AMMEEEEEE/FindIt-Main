import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();

function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// POST /api/auth/register
router.post("/register", async (req, res) => {
  const { name, regNo, email, password } = req.body;

  if (!name?.trim() || !regNo?.trim() || !email?.trim() || !password) {
    return res.status(400).json({ message: "Please fill in all fields." });
  }
  if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }
  if (password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const cleanEmail = email.trim().toLowerCase();
  const cleanRegNo = regNo.trim();

  const [existing] = await pool.query(
    "SELECT id FROM users WHERE email = ? OR reg_no = ?",
    [cleanEmail, cleanRegNo]
  );
  if (existing.length > 0) {
    return res.status(409).json({ message: "An account with this email or register number already exists." });
  }

  const hash = await bcrypt.hash(password, 10);

  // The role is never taken from the request. New accounts are always "user".
  await pool.query(
    "INSERT INTO users (name, reg_no, email, password_hash) VALUES (?, ?, ?, ?)",
    [name.trim(), cleanRegNo, cleanEmail, hash]
  );

  res.status(201).json({ message: "Account created. You can log in now." });
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email?.trim() || !password) {
    return res.status(400).json({ message: "Please enter your email and password." });
  }

  const [rows] = await pool.query(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [email.trim().toLowerCase()]
  );
  const user = rows[0];

  // Same message for "no such email" and "wrong password",
  // so nobody can use this to find out which emails are registered.
  const ok = user && (await bcrypt.compare(password, user.password_hash));
  if (!ok) {
    return res.status(401).json({ message: "Wrong email or password." });
  }

  res.json({
    token: makeToken(user),
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
  });
});

// GET /api/auth/me  (needs a token)
router.get("/me", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = ?",
    [req.user.id]
  );
  if (rows.length === 0) {
    return res.status(404).json({ message: "User not found." });
  }
  res.json({ user: rows[0] });
});

export default router;