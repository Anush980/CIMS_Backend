const User = require("../models/User");
const bcrypt = require("bcryptjs");

// --- GET CURRENT USER PROFILE ---
const getProfile = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).select("-password"); // hide password
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};

// --- UPDATE PROFILE INFO (name, jobTitle, shopName) ---
const updateProfile = async (req, res) => {
  try {
    const userId = req.user._id;
    const { name, jobTitle, shopName } = req.body;

    if (!name || !jobTitle || !shopName)
      return res.status(400).json({ message: "Name, Job Title, and Shop Name are required" });

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name, jobTitle, shopName },
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// --- UPDATE PASSWORD ---
const updatePassword = async (req, res) => {
  try {
    const userId = req.user._id;
    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "New password is required" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(userId, { password: hashed });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update password" });
  }
};

module.exports = { getProfile, updateProfile, updatePassword };
