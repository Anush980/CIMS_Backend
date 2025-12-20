const User = require("../models/User");

// --- TOGGLE SUPER ADMIN ---
// Only accessible by admin users
// This allows an admin to give or remove full superAdmin privileges to/from another user
const toggleSuperAdmin = async (req, res) => {
  try {
    // Only admin can toggle superAdmin
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can toggle super admin" });

    // Fetch the target user by ID
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent toggling self to avoid accidental privilege loss
    if (user._id.equals(req.user._id)) {
      return res.status(400).json({ message: "Cannot toggle super admin for yourself" });
    }

    // Toggle the superAdmin boolean
    user.superAdmin = !user.superAdmin;
    await user.save();

    res.status(200).json({
      message: `Super admin ${user.superAdmin ? "enabled" : "disabled"} for ${user.name}`,
      superAdmin: user.superAdmin,
    });
  } catch (err) {
    console.error("Toggle SuperAdmin Error:", err);
    res.status(500).json({ message: "Failed to toggle super admin" });
  }
};

module.exports = { toggleSuperAdmin };
