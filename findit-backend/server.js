import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import multer from "multer";
import pool from "./src/db.js";
import { UPLOAD_DIR } from "./src/middleware/upload.js";
import authRoutes from "./src/routes/auth.js";
import itemRoutes from "./src/routes/items.js";
import categoryRoutes from "./src/routes/categories.js";
import claimRoutes from "./src/routes/claims.js";
import statsRoutes from "./src/routes/stats.js";

dotenv.config();

const app = express();

// Allow the React app to call this server
app.use(cors({ origin: "http://localhost:5173" }));
// Let the server read JSON sent in request bodies
app.use(express.json());

// Serve the saved photos at /uploads/<file name>
app.use(
  "/uploads",
  express.static(UPLOAD_DIR, {
    setHeaders: (res) => res.setHeader("X-Content-Type-Options", "nosniff"),
  })
);

// Health check: confirms the server runs and can reach MySQL
app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "ok", database: "connected" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: "error", database: "not connected" });
  }
});

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/items", itemRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/claims", claimRoutes);
app.use("/api/stats", statsRoutes);

// Any error that was not handled inside a route ends up here
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    const message =
      err.code === "LIMIT_FILE_SIZE"
        ? "The photo is too large (3 MB maximum)."
        : "The photo could not be uploaded.";
    return res.status(400).json({ message });
  }
  if (err.message === "INVALID_IMAGE") {
    return res.status(400).json({ message: "Only JPG, PNG or WebP photos are allowed." });
  }

  console.error(err);
  res.status(500).json({ message: "Something went wrong on the server." });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`FindIt server running on http://localhost:${PORT}`);
});