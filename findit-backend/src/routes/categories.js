import { Router } from "express";
import pool from "../db.js";

const router = Router();

// GET /api/categories
router.get("/", async (req, res) => {
  const [rows] = await pool.query("SELECT id, name FROM categories ORDER BY id");
  res.json(rows);
});

export default router;