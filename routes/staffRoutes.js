const express = require("express");
const {
  addStaff,
  getStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
  resendStaffCredentials
} = require("../controllers/staffController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authMiddleware, getStaffs); // Get all staff
router.post("/", authMiddleware, addStaff); // Create staff
router.post("/:id/resend-credentials", authMiddleware, resendStaffCredentials); //resend credentials
router.get("/:id", authMiddleware, getStaffById); // Get staff by ID
router.put("/:id", authMiddleware, updateStaff); // Update staff
router.delete("/:id", authMiddleware, deleteStaff); // Delete staff

module.exports = router;
