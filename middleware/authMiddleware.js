// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ALWAYS use decoded.id (we standardize on this)
    const user = await User.findById(decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Attach FULL user document to req.user (keep _id for Mongo queries)
    req.user = user;

    next();
  } catch (err) {
    console.error("AuthMiddleware Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};


module.exports = authMiddleware;
