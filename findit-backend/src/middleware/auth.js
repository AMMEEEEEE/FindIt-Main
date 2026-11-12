import jwt from "jsonwebtoken";

// Use on routes that need a logged-in user
export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: "Please log in." });
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET); // { id, role }
    next();
  } catch {
    res.status(401).json({ message: "Session expired. Please log in again." });
  }
}

// Use after requireAuth on admin-only routes
export function requireAdmin(req, res, next) {
  if (req.user?.role !== "admin") {
    return res.status(403).json({ message: "Admins only." });
  }
  next();
}