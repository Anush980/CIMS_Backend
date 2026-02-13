const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const User = require('../models/User'); // Adjust path as needed
const { sendOTPEmail, sendPasswordChangeConfirmation } = require('../utils/optEmailService');

/**
 * Generate 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Hash OTP for storage
 */
const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};

/**
 * Step 1: Send OTP to email
 * POST /api/reset/send-otp
 */
exports.sendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    // If user not found, return error
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    // Check if user is active
    if (user.status === 'inactive') {
      return res.status(403).json({
        success: false,
        message: 'This account is inactive. Please contact support.',
      });
    }

    // Generate 6-digit OTP
    const otp = generateOTP();

    // Hash OTP for storage
    const hashedOTP = hashOTP(otp);

    // Save hashed OTP and expiry to user (10 minutes)
    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000; // 10 minutes
    user.resetPasswordOTPAttempts = 0; // Reset attempts
    await user.save();

    // Send OTP via email
    try {
      await sendOTPEmail(user.email, otp, user.name || user.username);
      console.log(`OTP sent to ${user.email}`);

      res.status(200).json({
        success: true,
        message: 'OTP has been sent to your email',
      });
    } catch (emailError) {
      // Remove OTP from database if sending fails
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      user.resetPasswordOTPAttempts = undefined;
      await user.save();

      console.error('OTP email sending failed:', emailError);

      return res.status(500).json({
        success: false,
        message: 'Failed to send OTP. Please try again.',
      });
    }
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
};

/**
 * Step 2: Verify OTP
 * POST /api/reset/verify-otp
 */
exports.verifyOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;

    // Validate inputs
    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and OTP',
      });
    }

    // Validate OTP format (6 digits)
    if (!/^\d{6}$/.test(otp)) {
      return res.status(400).json({
        success: false,
        message: 'OTP must be 6 digits',
      });
    }

    // Find user with valid OTP
    const user = await User.findOne({
      email: email.toLowerCase(),
      resetPasswordOTPExpire: { $gt: Date.now() },
    });

    if (!user || !user.resetPasswordOTP) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired OTP',
      });
    }

    // Check for too many attempts (prevent brute force)
    if (user.resetPasswordOTPAttempts >= 5) {
      // Clear OTP after too many attempts
      user.resetPasswordOTP = undefined;
      user.resetPasswordOTPExpire = undefined;
      user.resetPasswordOTPAttempts = undefined;
      await user.save();

      return res.status(429).json({
        success: false,
        message: 'Too many incorrect attempts. Please request a new OTP.',
      });
    }

    // Hash provided OTP and compare with stored hash
    const hashedOTP = hashOTP(otp);

    if (hashedOTP !== user.resetPasswordOTP) {
      // Increment failed attempts
      user.resetPasswordOTPAttempts = (user.resetPasswordOTPAttempts || 0) + 1;
      await user.save();

      return res.status(400).json({
        success: false,
        message: 'Invalid OTP',
        attemptsRemaining: 5 - user.resetPasswordOTPAttempts,
      });
    }

    // OTP is valid - generate a temporary token for password reset
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token and clear OTP
    user.resetPasswordToken = hashedToken;
    user.resetPasswordTokenExpire = Date.now() + 15 * 60 * 1000; // 15 minutes to reset password
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    user.resetPasswordOTPAttempts = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'OTP verified successfully',
      resetToken: resetToken, // Send this to frontend to use in password reset
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while verifying OTP',
    });
  }
};

/**
 * Step 3: Reset password with verified token
 * POST /api/reset/change-password
 */
exports.changePassword = async (req, res) => {
  try {
    const { resetToken, newPassword } = req.body;

    // Validate inputs
    if (!resetToken || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide reset token and new password',
      });
    }

    // Validate password strength
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Find user with valid token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordTokenExpire: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);

    // Clear all reset fields
    user.resetPasswordToken = undefined;
    user.resetPasswordTokenExpire = undefined;
    user.resetPasswordOTP = undefined;
    user.resetPasswordOTPExpire = undefined;
    user.resetPasswordOTPAttempts = undefined;

    await user.save();

    // Send confirmation email
    try {
      await sendPasswordChangeConfirmation(
        user.email,
        user.name || user.username
      );
    } catch (emailError) {
      console.error('Confirmation email failed:', emailError);
      // Don't fail the request
    }

    console.log(`Password changed successfully for ${user.email}`);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully. You can now log in with your new password.',
    });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while changing password',
    });
  }
};

/**
 * Optional: Resend OTP
 * POST /api/reset/resend-otp
 */
exports.resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email address',
      });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with this email',
      });
    }

    // Check if previous OTP was sent recently (prevent spam)
    if (user.resetPasswordOTPExpire && user.resetPasswordOTPExpire > Date.now()) {
      const timeLeft = Math.ceil((user.resetPasswordOTPExpire - Date.now()) / 5000 / 60);//10000 for 1 minute
      return res.status(429).json({
        success: false,
        message: `Please wait ${timeLeft} minute(s) before requesting a new OTP`,
      });
    }

    // Generate and send new OTP
    const otp = generateOTP();
    const hashedOTP = hashOTP(otp);

    user.resetPasswordOTP = hashedOTP;
    user.resetPasswordOTPExpire = Date.now() + 10 * 60 * 1000;
    user.resetPasswordOTPAttempts = 0;
    await user.save();

    await sendOTPEmail(user.email, otp, user.name || user.username);

    res.status(200).json({
      success: true,
      message: 'New OTP has been sent to your email',
    });
  } catch (error) {
    console.error('Resend OTP error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred. Please try again.',
    });
  }
};
