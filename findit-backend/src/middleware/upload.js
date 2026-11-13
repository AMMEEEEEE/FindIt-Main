import multer from "multer";
import path from "path";
import crypto from "crypto";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// findit-backend/uploads
export const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

// The only photo types we accept, and the extension we save each one with
const TYPES = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, UPLOAD_DIR),
  // A random name. The user's own file name is never used.
  filename: (req, file, cb) => cb(null, crypto.randomUUID() + TYPES[file.mimetype]),
});

export const upload = multer({
  storage,
  limits: { fileSize: 3 * 1024 * 1024, files: 1 }, // 3 MB, one photo
  fileFilter: (req, file, cb) => {
    if (TYPES[file.mimetype]) cb(null, true);
    else cb(new Error("INVALID_IMAGE"));
  },
});

// Delete a saved photo (used when a report fails or an item is deleted)
export async function removeImage(fileName) {
  if (!fileName) return;
  // path.basename makes sure a bad value can never point outside the uploads folder
  await fs.promises
    .unlink(path.join(UPLOAD_DIR, path.basename(fileName)))
    .catch(() => {});
}