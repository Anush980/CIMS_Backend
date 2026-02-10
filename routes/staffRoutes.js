const express = require("express");
const {
  addStaff,
  getStaffs,
  getStaffById,
  updateStaff,
  deleteStaff,
  resendStaffCredentials,
  resetStaffPassword, 
} = require("../controllers/staffController");

const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

router.get("/staff", authMiddleware, getStaffs);
router.post("/staff", authMiddleware,upload.single("image"), addStaff);

router.post("/staff/:id/resend", authMiddleware, resendStaffCredentials);

router.put("/staff/:id/password", authMiddleware, resetStaffPassword);

router.get("/staff/:id", authMiddleware, getStaffById);
router.put("/staff/:id", authMiddleware,upload.single("image"), updateStaff);
router.delete("/staff/:id", authMiddleware, deleteStaff);

module.exports = router;
