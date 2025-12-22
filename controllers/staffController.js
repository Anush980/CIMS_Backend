const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendStaffCredentials = require("../utils/sendStaffCredentials");
const generateStaffEmail = require("../utils/generateStaffEmail");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { canManageStaff } = require("../utils/permissions");


// Default staff image URL
const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1766223130/blank-profile_ouv09u.jpg`;

// --- CREATE STAFF ---
const addStaff = async (req, res) => {
  if (!canManageStaff(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
  try {
   if (!["admin", "owner"].includes(req.user.role))
    return res.status(403).json({ message: "Only admin or owner can perform this action" });


    const { name, jobTitle, password, staffPhone, staffEmail, staffAddress, salary } = req.body;

    if (!name || !password || !staffEmail)
      return res.status(400).json({ message: "Name, password, and personal email are required" });

    // Generate unique login email for staff
    const email = await generateStaffEmail(name, req.user.shopName);
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle image upload
    let imageUrl = DEFAULT_IMAGE_URL;
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "staff" },
          (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    const newStaff = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "staff",
      ownerId:req.user.id,
      shopName: req.user.shopName,
      jobTitle: jobTitle || "Staff",
      staffPhone,
      staffEmail,
      staffAddress,
      salary,
      image: imageUrl,
    });

    // Send credentials email to staff
    await sendStaffCredentials({
      to: staffEmail,
      name,
      loginEmail: email,
      password,
    });

    res.status(201).json({
      message: "Staff created successfully",
      staff: {
        _id: newStaff._id,
        ownerId:newStaff.ownerId,
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
    console.error("Add Staff Error:", err);
    res.status(500).json({ message: "Failed to create staff" });
  }
};

// --- GET ALL STAFF (Admin Only) ---
const getStaffs = async (req, res) => {
  if (!canManageStaff(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
  try {
   if (!["admin", "owner"].includes(req.user.role))
    return res.status(403).json({ message: "Only admin or owner can perform this action" });

    const { search, sort } = req.query;
    let query = { role: "staff", shopName: req.user.shopName };

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
    res.status(200).json(staffs);
  } catch (err) {
    console.error("Get Staffs Error:", err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

// --- GET STAFF BY ID (Admin Only) ---
const getStaffById = async (req, res) => {
  if (!canManageStaff(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
  try {
   if (!["admin", "owner"].includes(req.user.role))
    return res.status(403).json({ message: "Only admin or owner can perform this action" });

    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
      shopName: req.user.shopName,
    }).select("-password");

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.status(200).json(staff);
  } catch (err) {
    console.error("Get Staff By ID Error:", err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

// --- UPDATE STAFF (Admin Only) ---
const updateStaff = async (req, res) => {
  if (!canManageStaff(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
  try {
    if (!["admin", "owner"].includes(req.user.role))
    return res.status(403).json({ message: "Only admin or owner can perform this action" });


    const { name, jobTitle, staffPhone, staffAddress, salary, password } = req.body;
    const updateData = { name, jobTitle, staffPhone, staffAddress, salary };

    if (password) updateData.password = await bcrypt.hash(password, 10);

    // Handle image update
    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "staff" },
          (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      updateData.image = imageUrl;
    }

    const updatedStaff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff", shopName: req.user.shopName },
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedStaff) return res.status(404).json({ message: "Staff not found" });

    res.status(200).json(updatedStaff);
  } catch (err) {
    console.error("Update Staff Error:", err);
    res.status(500).json({ message: "Failed to update staff" });
  }
};

// --- RESET STAFF PASSWORD (Admin Only) ---
const resetStaffPassword = async (req, res) => {
  if (!canManageStaff(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
  try {
  if (!["admin", "owner"].includes(req.user.role))
    return res.status(403).json({ message: "Only admin or owner can perform this action" });


    const { newPassword } = req.body;
    if (!newPassword) return res.status(400).json({ message: "New password is required" });

    const hashed = await bcrypt.hash(newPassword, 10);

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff", shopName: req.user.shopName },
      { password: hashed },
      { new: true }
    );

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Staff Password Error:", err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// --- RESEND STAFF CREDENTIALS (Admin Only) ---
const resendStaffCredentials = async (req, res) => {
  if (!canManageStaff(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
  try {
  if (!["admin", "owner"].includes(req.user.role))
    return res.status(403).json({ message: "Only admin or owner can perform this action" });


    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
      shopName: req.user.shopName,
    });

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    await sendStaffCredentials({
      to: staff.staffEmail,
      name: staff.name,
      loginEmail: staff.email,
      password: null,
    });

    res.json({ message: "Credentials email resent successfully" });
  } catch (err) {
    console.error("Resend Staff Credentials Error:", err);
    res.status(500).json({ message: "Failed to resend credentials" });
  }
};

// --- DELETE STAFF ---
const deleteStaff = async (req, res) => {
  if (!canManageStaff(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
  try {
   if (!["admin", "owner"].includes(req.user.role))
    return res.status(403).json({ message: "Only admin or owner can perform this action" });


    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      role: "staff",
      shopName: req.user.shopName,
    });

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error("Delete Staff Error:", err);
    res.status(500).json({ message: "Failed to delete staff" });
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
