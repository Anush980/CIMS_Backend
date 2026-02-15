// src/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });
const { getProfile, updatePassword,updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

// Get current logged-in user's profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware,upload.single("image"), updateProfile);
// Update current logged-in user's password
router.put("/profile/password", authMiddleware, updatePassword);

module.exports = router;
