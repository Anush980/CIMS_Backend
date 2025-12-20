// middleware/roleMiddleware.js


// Handles role-based access control and staff permission checks
const User = require("../models/User");

// Middleware to check if user has one of the allowed roles
const checkRole = (allowedRoles) => async (req, res, next) => {
  try {
    const user = req.user || (await User.findById(req.user._id));
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isBlocked) return res.status(403).json({ message: "User is blocked" });

    if (!allowedRoles.includes(user.role)) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Attach currentUser for controllers if needed
    req.currentUser = user;
    next();
  } catch (err) {
    console.error("RoleMiddleware Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// Middleware to check specific staff permissions
// e.g., checkStaffPermission("canEdit") or checkStaffPermission("canDelete")
const checkStaffPermission = (action) => async (req, res, next) => {
  try {
    const user = req.user || (await User.findById(req.user._id));
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only staff have restricted permissions
    if (user.role === "staff" && !user.permissions[action]) {
      return res
        .status(403)
        .json({ message: "Contact shop owner to perform this action" });
    }

    next();
  } catch (err) {
    console.error("StaffPermissionMiddleware Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { checkRole, checkStaffPermission };
