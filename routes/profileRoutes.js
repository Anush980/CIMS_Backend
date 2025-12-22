// src/routes/profileRoutes.js
const express = require("express");
const router = express.Router();
const { getProfile, updatePassword,updateProfile } = require("../controllers/profileController");
const authMiddleware = require("../middleware/authMiddleware");

// Get current logged-in user's profile
router.get("/profile", authMiddleware, getProfile);
router.put("/profile", authMiddleware, updateProfile);
// Update current logged-in user's password
router.put("/password", authMiddleware, updatePassword);

module.exports = router;
