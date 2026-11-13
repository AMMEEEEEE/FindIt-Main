import { Router } from "express";
import pool from "../db.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";
import { upload, removeImage } from "../middleware/upload.js";

const router = Router();

// The columns sent to the browser.
// "contact" is left out on purpose, so it can never leak.
// "image" is just the file name. The frontend builds the full address.
const SELECT_ITEMS = `
  SELECT i.id, i.type, i.name, c.name AS category, i.location,
         DATE_FORMAT(i.item_date, '%d %b %Y') AS date,
         i.description, i.image_path AS image, i.status
  FROM items i
  JOIN categories c ON c.id = i.category_id
`;

const TYPES = ["lost", "found"];
const STATUSES = ["open", "pending", "resolved"];

// Returns an error message, or null if the report is fine
function checkReport({ type, name, location, contact, description, date }) {
  if (!TYPES.includes(type)) return "Type must be lost or found.";
  if (!name?.trim() || !location?.trim() || !description?.trim()) {
    return "Please fill in all fields.";
  }
  if (!/^\d{10}$/.test(String(contact || "").replace(/\s+/g, ""))) {
    return "Enter a valid 10-digit contact number.";
  }

  const when = new Date(date);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date || "") || isNaN(when)) {
    return "Enter a valid date.";
  }
  // One day of slack, because of time zones
  if (when > new Date(Date.now() + 24 * 60 * 60 * 1000)) {
    return "The date cannot be in the future.";
  }
  return null;
}

// GET /api/items?search=&type=&status=
router.get("/", async (req, res) => {
  const { search, type, status } = req.query;
  const where = [];
  const params = [];

  if (typeof search === "string" && search.trim()) {
    const like = `%${search.trim()}%`;
    where.push("(i.name LIKE ? OR i.location LIKE ? OR i.description LIKE ? OR c.name LIKE ?)");
    params.push(like, like, like, like);
  }
  if (TYPES.includes(type)) {
    where.push("i.type = ?");
    params.push(type);
  }
  if (STATUSES.includes(status)) {
    where.push("i.status = ?");
    params.push(status);
  }

  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  const [rows] = await pool.query(
    `${SELECT_ITEMS} ${whereSql} ORDER BY i.created_at DESC, i.id DESC`,
    params
  );
  res.json(rows);
});

// GET /api/items/mine  (must stay ABOVE /:id, or "mine" is read as an id)
router.get("/mine", requireAuth, async (req, res) => {
  const [rows] = await pool.query(
    `${SELECT_ITEMS} WHERE i.user_id = ? ORDER BY i.created_at DESC, i.id DESC`,
    [req.user.id]
  );
  res.json(rows);
});

// GET /api/items/:id
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Item not found." });
  }

  const [rows] = await pool.query(`${SELECT_ITEMS} WHERE i.id = ?`, [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Item not found." });
  }
  res.json(rows[0]);
});

// POST /api/items  (form data, with an optional "photo" file)
router.post("/", requireAuth, upload.single("photo"), async (req, res) => {
  const savedFile = req.file?.filename || null;

  // If anything below fails, the photo that was already saved is deleted
  async function reject(status, message) {
    await removeImage(savedFile);
    return res.status(status).json({ message });
  }

  try {
    const problem = checkReport(req.body);
    if (problem) return reject(400, problem);

    const [cat] = await pool.query("SELECT id FROM categories WHERE name = ?", [req.body.category]);
    if (cat.length === 0) return reject(400, "Unknown category.");

    const { type, name, location, date, description } = req.body;
    const contact = String(req.body.contact).replace(/\s+/g, "");

    // user_id comes from the login token, never from the request body
    const [result] = await pool.query(
      `INSERT INTO items (user_id, type, name, category_id, location, item_date, description, contact, image_path)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, type, name.trim(), cat[0].id, location.trim(), date, description.trim(), contact, savedFile]
    );

    res.status(201).json({ id: result.insertId, message: "Report submitted." });
  } catch (err) {
    await removeImage(savedFile);
    throw err;
  }
});

// PATCH /api/items/:id/status  (admin only)
router.patch("/:id/status", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;

  if (!Number.isInteger(id) || !STATUSES.includes(status)) {
    return res.status(400).json({ message: "Invalid item or status." });
  }

  const [result] = await pool.query("UPDATE items SET status = ? WHERE id = ?", [status, id]);
  if (result.affectedRows === 0) {
    return res.status(404).json({ message: "Item not found." });
  }
  res.json({ message: "Status updated." });
});

// DELETE /api/items/:id  (admin only)
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  const id = Number(req.params.id);
  if (!Number.isInteger(id)) {
    return res.status(404).json({ message: "Item not found." });
  }

  const [rows] = await pool.query("SELECT image_path FROM items WHERE id = ?", [id]);
  if (rows.length === 0) {
    return res.status(404).json({ message: "Item not found." });
  }

  await pool.query("DELETE FROM items WHERE id = ?", [id]);
  await removeImage(rows[0].image_path); // remove the photo from disk too
  res.json({ message: "Item deleted." });
});

export default router;