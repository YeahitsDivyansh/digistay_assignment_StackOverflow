const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "stacklite_dev_secret";

function auth(req, res, next) {
  const header = req.headers.authorization || "";
  if (!header.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Authentication required." });
  }

  const token = header.replace("Bearer ", "").trim();
  if (!token) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
    return next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
}

module.exports = auth;





