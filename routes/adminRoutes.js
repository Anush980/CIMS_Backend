const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const adminMiddleware = require("../middleware/adminMiddleware");
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer({ storage });

const {
  getAllUsers,
  getUserDetails,
  createUser,      // for POST
  updateUser,      // for PUT
  deleteUser,
  updateStaffPermissions,
  toggleBlockUser,
} = require("../controllers/adminController");

// Get all users
router.get("/users", authMiddleware, adminMiddleware, getAllUsers);

// Get user details
router.get("/users/:id", authMiddleware, adminMiddleware, getUserDetails);

// Create user
router.post("/users", authMiddleware, adminMiddleware, upload.single("image"), createUser);

// Update user
router.put("/users/:id", authMiddleware, adminMiddleware, upload.single("image"), updateUser);

// Delete user
router.delete("/users/:id", authMiddleware, adminMiddleware, deleteUser);

// Update staff permissions
router.patch("/staff/:id/permissions", authMiddleware, adminMiddleware, updateStaffPermissions);

// Block/unblock user
router.patch("/users/:id/block", authMiddleware, adminMiddleware, toggleBlockUser);

module.exports = router;
