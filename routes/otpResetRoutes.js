const express = require("express");
const {
  sendOTP,
  verifyOTP,
  changePassword,
  resendOTP,
} = require("../controllers/otpResetController");

const router = express.Router();

router.post("/send-otp", sendOTP);
router.post("/verify-otp", verifyOTP);
router.post("/change-password", changePassword);
router.post("/resend-otp", resendOTP);

module.exports = router;
