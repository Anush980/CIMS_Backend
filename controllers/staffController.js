const User = require("../models/User");
const bcrypt = require("bcryptjs");
const sendEmail = require("../utils/sendEmail"); 
const generateStaffEmail = require("../utils/generateStaffEmail");

// --- CREATE STAFF ---
const addStaff = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can create staff" });

    const {
      name,
      jobTitle,
      password,
      staffPhone,
      staffEmail,   // personal email
      staffAddress,
      salary,
    } = req.body;

    if (!name || !password || !staffEmail)
      return res.status(400).json({
        message: "Name, password, and personal email are required",
      });

    // Generate unique login email
    const email = await generateStaffEmail(name, req.user.shopName);

    const hashedPassword = await bcrypt.hash(password, 10);

    const newStaff = await User.create({
      name,
      email,           // system login
      password: hashedPassword,
      role: "staff",
      shopName: req.user.shopName,
      jobTitle: jobTitle || "Staff",
      staffPhone,
      staffEmail,      // personal email
      staffAddress,
      salary,
    });

    // Optional: send credentials to personal email
    
    await sendEmail({
      to: staffEmail,
      subject: "Your Staff Account Login Details",
      html: `
        <p>Hello ${name},</p>
        <p>Thanks for using Stockmate.</p>
        <p>Your staff account has been created.</p>
        <p><strong>Login Email:</strong> ${email}</p>
        <p><strong>Password:</strong> ${password}</p>
        <p>Please change your password after first login.</p>
      `,
    });
    

    res.status(201).json({
      message: "Staff created successfully",
      staff: {
        _id: newStaff._id,
        name: newStaff.name,
        email: newStaff.email,
        staffEmail: newStaff.staffEmail,
        jobTitle: newStaff.jobTitle,
        staffPhone: newStaff.staffPhone,
        staffAddress: newStaff.staffAddress,
        salary: newStaff.salary,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to create staff" });
  }
};

// --- GET ALL STAFF ---
const getStaffs = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can view staff" });

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
    console.error(err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

// --- GET STAFF BY ID ---
const getStaffById = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can view staff" });

    const staff = await User.findOne({
      _id: req.params.id,
      role: "staff",
      shopName: req.user.shopName,
    }).select("-password");

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.status(200).json(staff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch staff" });
  }
};

// --- UPDATE STAFF ---
const updateStaff = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can update staff" });

    const { name, jobTitle, staffPhone, staffAddress, salary, password } = req.body;

    const updateData = { name, jobTitle, staffPhone, staffAddress, salary };

    if (password) {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updatedStaff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff", shopName: req.user.shopName },
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedStaff) return res.status(404).json({ message: "Staff not found" });

    res.status(200).json(updatedStaff);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update staff" });
  }
};

// --- RESET STAFF PASSWORD (admin) ---
const resetStaffPassword = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can reset password" });

    const { newPassword } = req.body;

    if (!newPassword)
      return res.status(400).json({ message: "New password is required" });

    const hashed = await bcrypt.hash(newPassword, 10);

    const staff = await User.findOneAndUpdate(
      { _id: req.params.id, role: "staff", shopName: req.user.shopName },
      { password: hashed },
      { new: true }
    );

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.json({ message: "Password reset successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to reset password" });
  }
};

// --- DELETE STAFF ---
const deleteStaff = async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Only admin can delete staff" });

    const staff = await User.findOneAndDelete({
      _id: req.params.id,
      role: "staff",
      shopName: req.user.shopName,
    });

    if (!staff) return res.status(404).json({ message: "Staff not found" });

    res.status(200).json({ message: "Staff deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete staff" });
  }
};

module.exports = {
  addStaff,
  getStaffs,
  getStaffById,
  updateStaff,
  resetStaffPassword,
  deleteStaff,
  
};
