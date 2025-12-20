// middleware/authMiddleware.js

// Verifies JWT token and attaches user to request
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Check if Authorization header exists and has Bearer token
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Please login first" });
  }

  const token = authHeader.split(" ")[1];

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user from DB using ID in token
    const user = await User.findById(decoded._id || decoded.id);
    if (!user) return res.status(401).json({ message: "User not found" });

    // Attach user object to request for downstream middleware/controllers
    req.user = user;
    next();
  } catch (err) {
    console.error("AuthMiddleware Error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

module.exports = authMiddleware;
