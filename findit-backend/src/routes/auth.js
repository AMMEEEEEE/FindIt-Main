import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import pool from "../db.js";
import { requireAuth } from "../middleware/auth.js";
import { sendResetEmail } from "../mailer.js";

const router = Router();

function makeToken(user) {
  return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });
}

// Scramble a reset token so only the scrambled copy is stored
function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
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

// POST /api/auth/forgot-password
router.post("/forgot-password", async (req, res) => {
  const email = String(req.body.email || "").trim().toLowerCase();

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return res.status(400).json({ message: "Please enter a valid email address." });
  }

  // The same answer every time, whether or not the account exists
  const reply = {
    message: "If an account exists for this email, a reset link has been sent.",
  };

  const [users] = await pool.query("SELECT id FROM users WHERE email = ?", [email]);
  if (users.length === 0) return res.json(reply);

  const userId = users[0].id;

  // Allow only one request per minute for the same account
  const [recent] = await pool.query(
    "SELECT id FROM password_resets WHERE user_id = ? AND created_at > NOW() - INTERVAL 1 MINUTE",
    [userId]
  );
  if (recent.length > 0) return res.json(reply);

  // The real token goes in the email. Only its scrambled copy is saved.
  const token = crypto.randomBytes(32).toString("hex");

  await pool.query("DELETE FROM password_resets WHERE user_id = ?", [userId]);
  await pool.query(
    "INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES (?, ?, NOW() + INTERVAL 30 MINUTE)",
    [userId, hashToken(token)]
  );

  const base = process.env.FRONTEND_URL || "http://localhost:5173";
  try {
    await sendResetEmail(email, `${base}/reset-password/${token}`);
  } catch (err) {
    // Don't tell the user, or it would reveal that the account exists
    console.error("Could not send reset email:", err.message);
  }

  res.json(reply);
});

// POST /api/auth/reset-password  body: { token, password }
router.post("/reset-password", async (req, res) => {
  const { token, password } = req.body;
  const invalid = "This reset link is invalid or has expired.";

  if (typeof token !== "string" || !token) {
    return res.status(400).json({ message: invalid });
  }
  if (!password || password.length < 6) {
    return res.status(400).json({ message: "Password must be at least 6 characters." });
  }

  const [rows] = await pool.query(
    "SELECT user_id FROM password_resets WHERE token_hash = ? AND expires_at > NOW()",
    [hashToken(token)]
  );
  if (rows.length === 0) {
    return res.status(400).json({ message: invalid });
  }

  const userId = rows[0].user_id;
  const hash = await bcrypt.hash(password, 10);

  await pool.query("UPDATE users SET password_hash = ? WHERE id = ?", [hash, userId]);
  // The link works only once
  await pool.query("DELETE FROM password_resets WHERE user_id = ?", [userId]);

  res.json({ message: "Password updated. You can log in now." });
});

export default router;