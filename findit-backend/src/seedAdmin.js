import bcrypt from "bcryptjs";
import pool from "./db.js";

// Run with: node src/seedAdmin.js admin@college.edu YourPassword
const [email, password] = process.argv.slice(2);

if (!email || !password || password.length < 6) {
  console.log("Usage: node src/seedAdmin.js <email> <password (6+ characters)>");
  process.exit(1);
}

const [existing] = await pool.query("SELECT id FROM users WHERE email = ?", [email.toLowerCase()]);

if (existing.length > 0) {
  console.log("A user with this email already exists.");
} else {
  const hash = await bcrypt.hash(password, 10);
  await pool.query(
    "INSERT INTO users (name, reg_no, email, password_hash, role) VALUES (?, ?, ?, ?, 'admin')",
    ["Admin", "ADMIN001", email.toLowerCase(), hash]
  );
  console.log("Admin created:", email);
}

await pool.end();