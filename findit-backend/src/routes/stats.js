import { Router } from "express";
import pool from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/stats  (admin only)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const [[counts]] = await pool.query(
    `SELECT COUNT(*) AS total,
            COALESCE(SUM(status = 'open'), 0)     AS openCount,
            COALESCE(SUM(status = 'pending'), 0)  AS pendingCount,
            COALESCE(SUM(status = 'resolved'), 0) AS resolvedCount
     FROM items`
  );

  const [[claimCount]] = await pool.query(
    "SELECT COUNT(*) AS n FROM claims WHERE status = 'pending'"
  );

  const [recent] = await pool.query(
    `SELECT id, name, type, status, DATE_FORMAT(item_date, '%d %b %Y') AS date
     FROM items
     ORDER BY created_at DESC, id DESC
     LIMIT 4`
  );

  const [pendingClaims] = await pool.query(
    `SELECT c.id, i.id AS itemId, i.name AS itemName, u.name AS claimant,
            DATE_FORMAT(c.created_at, '%d %b %Y') AS submitted
     FROM claims c
     JOIN items i ON i.id = c.item_id
     JOIN users u ON u.id = c.user_id
     WHERE c.status = 'pending'
     ORDER BY c.created_at DESC, c.id DESC
     LIMIT 5`
  );

  res.json({
    total: Number(counts.total),
    open: Number(counts.openCount),
    pending: Number(counts.pendingCount),
    resolved: Number(counts.resolvedCount),
    pendingClaimsCount: Number(claimCount.n),
    recent,
    pendingClaims,
  });
});

export default router;