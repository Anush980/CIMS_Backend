const User = require("../models/User");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Default user profile image
const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1766223130/blank-profile_ouv09u.jpg`;

// --- GET CURRENT USER PROFILE ---
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json(user);
  } catch (err) {
    console.error("Get Profile Error:", err);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
};


// --- UPDATE PROFILE INFO ---
const updateProfile = async (req, res) => {
  try {
    const { name, jobTitle, shopName } = req.body;

    // name & jobTitle are allowed for everyone
    if (!name || !jobTitle) {
      return res.status(400).json({
        message: "Name and Job Title are required",
      });
    }

    let updateData = {
      name,
      jobTitle,
    };

    // 🔒 Only admin or owner can change shopName
    if (["admin", "owner"].includes(req.user.role)) {
      if (!shopName) {
        return res.status(400).json({
          message: "Shop name is required for admin/owner",
        });
      }
      updateData.shopName = shopName;
    }

    // Handle profile image upload
    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile" },
          (error, result) =>
            error ? reject(error) : resolve(result.secure_url)
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      updateData.image = imageUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select("-password");

    res.status(200).json(updatedUser);
  } catch (err) {
    console.error("Update Profile Error:", err);
    res.status(500).json({ message: "Failed to update profile" });
  }
};


// --- UPDATE PASSWORD ---
const updatePassword = async (req, res) => {
  try {
    const { newPassword } = req.body;

    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(req.user._id, { password: hashed });

    res.status(200).json({ message: "Password updated successfully" });
  } catch (err) {
    console.error("Update Password Error:", err);
    res.status(500).json({ message: "Failed to update password" });
  }
};

module.exports = { getProfile, updateProfile, updatePassword };
