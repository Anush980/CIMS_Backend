const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendStaffCredentials = require("../utils/sendStaffCredentials");
const generateStaffEmail = require("../utils/generateStaffEmail");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { canManageStaff } = require("../utils/permissions");

// Default staff image URL
const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1766223130/blank-profile_ouv09u.jpg`;

// Default password used when creating staff without a password, or when resending credentials
const SUPER_PASSWORD = process.env.STAFF_SUPER_PASSWORD || "default123";

// ─── Shared Helpers ────────────────────────────────────────────────────────────

/**
 * Centralized auth guard — call this at the top of every handler.
 * Returns true if the request should be blocked (and already sends the 403).
 */
const denyIfNotAuthorized = (req, res) => {
  if (!canManageStaff(req.user.role)) {
    res.status(403).json({ message: "Access denied" });
    return true;
  }
  return false;
};

/**
 * Upload a file buffer to Cloudinary and return the secure URL.
 */
const uploadToCloudinary = (fileBuffer) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "staff" },
      (error, result) => (error ? reject(error) : resolve(result.secure_url))
    );
    streamifier.createReadStream(fileBuffer).pipe(stream);
  });

/**
 * Centralized error responder — always includes the error message so Postman
 * shows you exactly what went wrong.
 */
const sendError = (res, statusCode, message, err) => {
  console.error(`[Staff Error] ${message}`, err);
  return res.status(statusCode).json({
    message,
    error: err?.message || String(err),
    ...(process.env.NODE_ENV !== "production" && { stack: err?.stack }),
  });
};

// ─── CREATE STAFF ──────────────────────────────────────────────────────────────

const addStaff = async (req, res) => {
  if (denyIfNotAuthorized(req, res)) return;

  try {
    const {
      name,
      jobTitle,
      staffPhone,
      staffEmail,
      staffAddress,
      salary,
    } = req.body;

    // Use provided password or fall back to the super/default password
    const rawPassword = req.body.password?.trim() || SUPER_PASSWORD;

    if (!name || !staffEmail) {
      return res
        .status(400)
        .json({ message: "Name and personal email are required" });
    }

    const email = await generateStaffEmail(name, req.user.shopName);
    const hashedPassword = await bcrypt.hash(rawPassword, 10);

    const imageUrl = req.file
      ? await uploadToCloudinary(req.file.buffer)
      : DEFAULT_IMAGE_URL;

    const newStaff = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      ownerId: req.user.id,
      shopName: req.user.shopName,
      jobTitle: jobTitle || "Staff",
      staffPhone,
      staffEmail,
      staffAddress,
      salary,
      image: imageUrl,
    });

    await sendStaffCredentials({
      to: staffEmail,
      name,
      loginEmail: email,
      password: rawPassword,
    });

    return res.status(201).json({
      message: "Staff created successfully",
      staff: {
        _id: newStaff._id,
        ownerId: newStaff.ownerId,
        name: newStaff.name,
        email: newStaff.email,
        staffEmail: newStaff.staffEmail,
        jobTitle: newStaff.jobTitle,
        staffPhone: newStaff.staffPhone,
        staffAddress: newStaff.staffAddress,
        salary: newStaff.salary,
        image: newStaff.image,
      },
    });
  } catch (err) {
    return sendError(res, 500, "Failed to create staff", err);
  }
};

// ─── GET ALL STAFF ─────────────────────────────────────────────────────────────

const getStaffs = async (req, res) => {
  if (denyIfNotAuthorized(req, res)) return;

  try {
    const { search, sort } = req.query;
    const query = { role: "staff", shopName: req.user.shopName };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { jobTitle: { $regex: search, $options: "i" } },
        { staffPhone: { $regex: search, $options: "i" } },
      ];
    }

    let staffsQuery = User.find(query).select("-password");

    if (sort === "recent") staffsQuery = staffsQuery.sort({ createdAt: -1 });
    else if (sort === "oldest") staffsQuery = staffsQuery.sort({ createdAt: 1 });
    else staffsQuery = staffsQuery.sort({ _id: -1 });

    const staffs = await staffsQuery;
    return res.status(200).json(staffs);
  } catch (err) {
    return sendError(res, 500, "Failed to fetch staff", err);
  }
};

// ─── GET STAFF BY ID ───────────────────────────────────────────────────────────

const getStaffById = async (req, res) => {
  if (denyIfNotAuthorized(req, res)) return;

  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
      shopName: req.user.shopName,
    }).select("-password");

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    return res.status(200).json(staff);
  } catch (err) {
    return sendError(res, 500, "Failed to fetch staff", err);
  }
};

// ─── UPDATE STAFF ──────────────────────────────────────────────────────────────

const updateStaff = async (req, res) => {
  if (denyIfNotAuthorized(req, res)) return;

  try {
    const { name, jobTitle, staffPhone, staffAddress, salary, password } =
      req.body;

    const updateData = { name, jobTitle, staffPhone, staffAddress, salary };

    if (password?.trim()) {
      updateData.password = await bcrypt.hash(password.trim(), 10);
    }

    if (req.file) {
      updateData.image = await uploadToCloudinary(req.file.buffer);
    }

    const updatedStaff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff", shopName: req.user.shopName },
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedStaff)
      return res.status(404).json({ message: "Staff not found" });

    return res.status(200).json(updatedStaff);
  } catch (err) {
    return sendError(res, 500, "Failed to update staff", err);
  }
};

// ─── RESET STAFF PASSWORD ──────────────────────────────────────────────────────

const resetStaffPassword = async (req, res) => {
  if (denyIfNotAuthorized(req, res)) return;

  try {
    // Fall back to super password if no new password is supplied
    const rawPassword = req.body.newPassword?.trim() || SUPER_PASSWORD;

    const hashed = await bcrypt.hash(rawPassword, 10);

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff", shopName: req.user.shopName },
      { password: hashed },
      { new: true }
    );

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    return res.json({
      message: "Password reset successfully",
      usedDefaultPassword: !req.body.newPassword?.trim(),
    });
  } catch (err) {
    return sendError(res, 500, "Failed to reset password", err);
  }
};

// ─── RESEND STAFF CREDENTIALS ──────────────────────────────────────────────────

const resendStaffCredentials = async (req, res) => {
  if (denyIfNotAuthorized(req, res)) return;

  try {
    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
      shopName: req.user.shopName,
    });

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    // Reset to super password so the email contains a usable credential
    const hashed = await bcrypt.hash(SUPER_PASSWORD, 10);
    staff.password = hashed;
    await staff.save();

    await sendStaffCredentials({
      to: staff.staffEmail,
      name: staff.name,
      loginEmail: staff.email,
      password: SUPER_PASSWORD,
    });

    return res.json({
      message: "Credentials resent successfully. Password has been reset to the default.",
    });
  } catch (err) {
    return sendError(res, 500, "Failed to resend credentials", err);
  }
};

// ─── DELETE STAFF ──────────────────────────────────────────────────────────────

const deleteStaff = async (req, res) => {
  if (denyIfNotAuthorized(req, res)) return;

  try {
    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      role: "staff",
      shopName: req.user.shopName,
    });

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    return res.status(200).json({ message: "Staff deleted successfully" });
  } catch (err) {
    return sendError(res, 500, "Failed to delete staff", err);
  }
};

module.exports = {
  addStaff,
  getStaffs,
  getStaffById,
  updateStaff,
  resetStaffPassword,
  resendStaffCredentials,
  deleteStaff,
};