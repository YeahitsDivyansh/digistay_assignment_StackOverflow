const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "stacklite_dev_secret";

function adminAuth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Admin authentication required." });
  }

  const token = header.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ message: "Admin authentication required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    if (payload.kind !== "ADMIN") {
      return res.status(403).json({ message: "Admin privileges required." });
    }
    req.admin = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired admin token." });
  }
}

module.exports = adminAuth;






