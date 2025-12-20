// middleware/adminOnly.js

// Simple middleware to restrict route to admins only
const adminOnly = (req, res, next) => {
  if (!req.user || req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admin only." });
  }
  next();
};

module.exports = adminOnly;
