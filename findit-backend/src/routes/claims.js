import { Router } from "express";
import pool from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// POST /api/claims
router.post("/", requireAuth, async (req, res) => {
  const itemId = Number(req.body.itemId);
  const answer = String(req.body.answer || "").trim();

  if (!Number.isInteger(itemId) || !answer) {
    return res.status(400).json({ message: "Please describe why this item is yours." });
  }
  if (answer.length > 1000) {
    return res.status(400).json({ message: "Your claim is too long (1000 characters max)." });
  }

  const [items] = await pool.query("SELECT user_id FROM items WHERE id = ?", [itemId]);
  if (items.length === 0) {
    return res.status(404).json({ message: "Item not found." });
  }
  if (items[0].user_id === req.user.id) {
    return res.status(400).json({ message: "You cannot claim your own report." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    // Only succeeds if the item is still open, so two people
    // cannot claim it at the same moment.
    const [lock] = await conn.query(
      "UPDATE items SET status = 'pending' WHERE id = ? AND status = 'open'",
      [itemId]
    );
    if (lock.affectedRows === 0) {
      await conn.rollback();
      return res.status(409).json({ message: "This item is not open for claims." });
    }

    await conn.query(
      "INSERT INTO claims (item_id, user_id, answer) VALUES (?, ?, ?)",
      [itemId, req.user.id, answer]
    );

    await conn.commit();
    res.status(201).json({ message: "Claim submitted." });
  } catch (err) {
    await conn.rollback();
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ message: "You have already submitted a claim for this item." });
    }
    throw err;
  } finally {
    conn.release();
  }
});

// GET /api/claims/mine
router.get("/mine", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.status, c.answer,
            DATE_FORMAT(c.created_at, '%d %b %Y') AS submitted,
            i.id AS itemId, i.name AS itemName, cat.name AS category, i.location,
            CASE WHEN c.status = 'approved' THEN i.contact ELSE NULL END AS contact
     FROM claims c
     JOIN items i ON i.id = c.item_id
     JOIN categories cat ON cat.id = i.category_id
     WHERE c.user_id = ?
     ORDER BY c.created_at DESC, c.id DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// GET /api/claims  (admin only)
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  const [rows] = await pool.query(
    `SELECT c.id, c.status, c.answer,
            DATE_FORMAT(c.created_at, '%d %b %Y') AS submitted,
            i.id AS itemId, i.name AS itemName,
            u.name AS claimant, u.reg_no AS claimantRegNo
     FROM claims c
     JOIN items i ON i.id = c.item_id
     JOIN users u ON u.id = c.user_id
     ORDER BY c.created_at DESC, c.id DESC`
  );
  res.json(rows);
});

// PATCH /api/claims/:id  (admin only)  body: { "status": "approved" | "rejected" }
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || !["approved", "rejected"].includes(status)) {
    return res.status(400).json({ message: "Status must be approved or rejected." });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const [rows] = await conn.query(
      "SELECT item_id, status FROM claims WHERE id = ? FOR UPDATE",
      [id]
    );
    if (rows.length === 0) {
      await conn.rollback();
      return res.status(404).json({ message: "Claim not found." });
    }
    if (rows[0].status !== "pending") {
      await conn.rollback();
      return res.status(409).json({ message: "This claim was already reviewed." });
    }

    await conn.query(
      "UPDATE claims SET status = ?, reviewed_at = NOW() WHERE id = ?",
      [status, id]
    );
    // Approved: item is done. Rejected: item goes back to open.
    await conn.query("UPDATE items SET status = ? WHERE id = ?", [
      status === "approved" ? "resolved" : "open",
      rows[0].item_id,
    ]);

    await conn.commit();
    res.json({ message: `Claim ${status}.` });
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
});

export default router;