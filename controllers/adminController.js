const User = require("../models/User");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Default profile image
const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1766223130/blank-profile_ouv09u.jpg`;

// ===== PERMISSION HELPER =====
const isSuperAdmin = (user) => {
  return user.role === "admin" && user.superAdmin === true;
};

// -------------------- GET ALL USERS --------------------
const getAllUsers = async (req, res) => {
  try {
    const { search, sort, role } = req.query; // Added `role` filter
    const reqUser = req.user;

    // Only super admins can see all users
    if (!isSuperAdmin(reqUser)) {
      return res.status(403).json({ 
        message: "Access denied. Only super admins can view all users." 
      });
    }

    let query = {};

    // Search by name, email, shopName, role
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    // Role filter (category equivalent)
    if (role) query.role = role; // filter by role if provided

    let usersQuery = User.find(query, "-password");

    // Sorting
    if (sort === "recent") usersQuery = usersQuery.sort({ createdAt: -1 });
    else if (sort === "oldest") usersQuery = usersQuery.sort({ createdAt: 1 });
    else usersQuery = usersQuery.sort({ _id: -1 });

    const users = await usersQuery;
    res.status(200).json({ users });
  } catch (err) {
    console.error("Get users Error:", err);
    res.status(500).json({ error: err.message });
  }
};


// -------------------- GET USER DETAILS --------------------
const getUserDetails = async (req, res) => {
  try {
    // Only super admins can view any user's details
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ 
        message: "Access denied. Only super admins can view user details." 
      });
    }

    const user = await User.findById(req.params.id, "-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    let staffs = [];
    if (user.role === "owner") {
      staffs = await User.find({ ownerId: user._id }, "-password");
    }

    res.status(200).json({ user, staffs });
  } catch (err) {
    console.error("Get user details error:", err);
    res.status(500).json({ message: "Failed to fetch user details" });
  }
};

// -------------------- CREATE USER --------------------
const createUser = async (req, res) => {
  try {
    // Only super admins can create users
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ 
        message: "Access denied. Only super admins can create users." 
      });
    }

    const {
      name,
      email,
      phone,
      role,
      shopName,
      staffEmail,
      staffPhone,
      password, 
    } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({ 
        message: "Name, email, and password are required" 
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ 
        message: "Email already exists" 
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Handle image upload
    let imageUrl = DEFAULT_IMAGE_URL;
    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile" },
          (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    const newUser = new User({
      name,
      email: email.toLowerCase(),
      phone,
      role: role || "customer",
      shopName: shopName || "",
      staffEmail: staffEmail || "",
      staffPhone: staffPhone || "",
      password: hashedPassword,
      image: imageUrl,
    });

    // Handle permissions (for staff users)
    if (req.body.permissions && typeof req.body.permissions === "string") {
      let permissions = JSON.parse(req.body.permissions);
      permissions.canEdit = !!permissions.canEdit;
      permissions.canDelete = !!permissions.canDelete;
      newUser.permissions = permissions;
    } else if (req.body.permissions && typeof req.body.permissions === "object") {
      newUser.permissions = {
        canEdit: !!req.body.permissions.canEdit,
        canDelete: !!req.body.permissions.canDelete,
      };
    }

    // Set blocked status
    newUser.isBlocked = !!req.body.isBlocked;

    // Only super admin can create other super admins
    if (req.body.superAdmin === true) {
      newUser.superAdmin = true;
    }

    await newUser.save();

    // Return user without password
    const { password: pw, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({ 
      message: "User created successfully", 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: err.message });
  }
};

// -------------------- UPDATE USER --------------------
const updateUser = async (req, res) => {
  try {
    // Only super admins can update users
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ 
        message: "Access denied. Only super admins can update users." 
      });
    }

    const userId = req.params.id;

    // Prevent updating your own super admin status
    if (userId === req.user._id.toString() && req.body.superAdmin === false) {
      return res.status(400).json({ 
        message: "You cannot remove your own super admin status" 
      });
    }

    // Only allow updating specific fields
    const allowedFields = [
      "name",
      "email",
      "phone",
      "role",
      "shopName",
      "staffEmail",
      "staffPhone",
      "staffAddress",
      "salary",
      "permissions",
      "superAdmin",
      "isBlocked",
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) updateData[field] = req.body[field];
    });

    // Handle permissions safely
    if (req.body.permissions) {
      let permissions = req.body.permissions;
      if (typeof permissions === "string") {
        permissions = JSON.parse(permissions);
      }
      updateData.permissions = {
        canEdit: !!permissions.canEdit,
        canDelete: !!permissions.canDelete,
      };
    }

    // Prevent admin from blocking themselves
    if (updateData.isBlocked && userId === req.user._id.toString()) {
      return res.status(400).json({ 
        message: "You cannot block yourself" 
      });
    }

    // Handle phone logic for staff
    if (updateData.role === "staff") {
      updateData.phone = updateData.staffPhone || "";
    }

    // Handle image upload
    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "profile" },
          (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      updateData.image = imageUrl;
    }

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, {
      new: true,
      runValidators: true,
    }).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "User updated successfully", 
      user: updatedUser 
    });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(500).json({ error: err.message });
  }
};

// -------------------- DELETE USER --------------------
const deleteUser = async (req, res) => {
  try {
    // Only super admins can delete users
    if (!isSuperAdmin(req.user)) {
      return res.status(403).json({ 
        message: "Access denied. Only super admins can delete users." 
      });
    }

    const userId = req.params.id;

    // Prevent deleting yourself
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ 
        message: "You cannot delete yourself" 
      });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ 
      message: "User deleted successfully" 
    });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// -------------------- UPDATE STAFF PERMISSIONS --------------------
const updateStaffPermissions = async (req, res) => {
  try {
    // Only super admins and owners can update staff permissions
    if (!isSuperAdmin(req.user) && req.user.role !== "owner") {
      return res.status(403).json({ 
        message: "Access denied. Only super admins or owners can update staff permissions." 
      });
    }

    const { canEdit, canDelete } = req.body;
    const staff = await User.findById(req.params.id);
    
    if (!staff) {
      return res.status(404).json({ message: "Staff not found" });
    }

    if (staff.role !== "staff") {
      return res.status(400).json({ 
        message: "This user is not a staff member" 
      });
    }

    // If owner, ensure they own this staff
    if (req.user.role === "owner" && staff.ownerId?.toString() !== req.user._id.toString()) {
      return res.status(403).json({ 
        message: "You can only update permissions for your own staff" 
      });
    }

    staff.permissions = {
      canEdit: !!canEdit,
      canDelete: !!canDelete,
    };

    await staff.save();
    
    res.status(200).json({ 
      message: "Permissions updated successfully", 
      permissions: staff.permissions 
    });
  } catch (err) {
    console.error("Update staff permissions error:", err);
    res.status(500).json({ message: "Failed to update permissions" });
  }
};

// -------------------- TOGGLE BLOCK / UNBLOCK --------------------
const toggleBlockUser = async (req, res) => {
  try {
    const reqUser = req.user;
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Only admins and superadmins can toggle
    if (!isSuperAdmin(reqUser) && reqUser.role !== "admin") {
      return res.status(403).json({ message: "Access denied. Only admins or superadmins can block users." });
    }

    // Prevent self-block
    if (reqUser._id.toString() === user._id.toString()) {
      return res.status(400).json({ message: "You cannot block yourself" });
    }

    // Admin cannot block other admins
    if (user.role === "admin" && !isSuperAdmin(reqUser)) {
      return res.status(403).json({ message: "Only superadmins can block other admins" });
    }

    // Toggle block
    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({
      message: `User ${user.isBlocked ? "blocked" : "unblocked"} successfully`,
      isBlocked: user.isBlocked,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        isBlocked: user.isBlocked,
      }
    });
  } catch (err) {
    console.error("Toggle block error:", err);
    res.status(500).json({ message: "Failed to toggle block status" });
  }
};


module.exports = {
  getAllUsers,
  getUserDetails,
  createUser,    
  updateUser,
  deleteUser,
  updateStaffPermissions,
  toggleBlockUser,
};