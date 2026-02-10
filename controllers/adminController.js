const User = require("../models/User");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");

// Default profile image
const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1766223130/blank-profile_ouv09u.jpg`;

// -------------------- GET ALL USERS --------------------
const getAllUsers = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { shopName: { $regex: search, $options: "i" } },
        { role: { $regex: search, $options: "i" } },
      ];
    }

    let usersQuery = User.find(query, "-password");

    if (sort === "recent") usersQuery = usersQuery.sort({ createdAt: -1 });
    else if (sort === "oldest") usersQuery = usersQuery.sort({ createdAt: 1 });
    else usersQuery = usersQuery.sort({ _id: -1 });

    const users = await usersQuery;
    res.status(200).json({ users });
  } catch (err) {
    console.error("Get users Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// -------------------- GET USER DETAILS --------------------
const getUserDetails = async (req, res) => {
  try {
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

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name,
      email,
      phone,
      role,
      shopName: shopName || "",
      staffEmail: staffEmail || "",
      staffPhone: staffPhone || "",
      password: hashedPassword, // <-- set hashed password
    });

    // Permissions (optional)
    if (req.body.permissions && typeof req.body.permissions === "string") {
      let permissions = JSON.parse(req.body.permissions);
      permissions.canEdit = !!permissions.canEdit;
      permissions.canDelete = !!permissions.canDelete;
      newUser.permissions = permissions;
    }

    // Blocked
    newUser.isBlocked = !!req.body.isBlocked;

    // Handle uploaded image (optional)
    if (req.file) {
      newUser.image = req.file.buffer; // or Cloudinary
    }

    await newUser.save();

    // Return user without password
    const { password: pw, ...userWithoutPassword } = newUser.toObject();

    res.status(201).json({ message: "User created", user: userWithoutPassword });
  } catch (err) {
    console.error("Create user error:", err);
    res.status(500).json({ message: err.message });
  }
};



// -------------------- UPDATE USER --------------------
const updateUser = async (req, res) => {
  try {
    const userId = req.params.id;

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
      if (typeof permissions === "string") permissions = JSON.parse(permissions);
      permissions.canEdit = !!permissions.canEdit;
      permissions.canDelete = !!permissions.canDelete;
      updateData.permissions = permissions;
    }

    // Prevent admin from blocking themselves
    if (updateData.isBlocked && req.user.role === "admin" && req.user._id === req.params.id) {
      updateData.isBlocked = false;
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

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User updated", user: updatedUser });
  } catch (err) {
    console.error("Update user error:", err);
    res.status(400).json({ error: err.message });
  }
};

// -------------------- DELETE USER --------------------
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Failed to delete user" });
  }
};

// -------------------- UPDATE STAFF PERMISSIONS --------------------
const updateStaffPermissions = async (req, res) => {
  try {
    const { canEdit, canDelete } = req.body;
    const staff = await User.findById(req.params.id);
    if (!staff || staff.role !== "staff")
      return res.status(404).json({ message: "Staff not found" });

    staff.permissions.canEdit = !!canEdit;
    staff.permissions.canDelete = !!canDelete;

    await staff.save();
    res
      .status(200)
      .json({ message: "Permissions updated", permissions: staff.permissions });
  } catch (err) {
    console.error("Update staff permissions error:", err);
    res.status(500).json({ message: "Failed to update permissions" });
  }
};

// -------------------- TOGGLE BLOCK / UNBLOCK --------------------
const toggleBlockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Prevent admin from blocking themselves
    if (user.role === "admin" && req.user._id === user._id.toString()) {
      return res.status(400).json({ message: "Admin cannot block themselves" });
    }

    user.isBlocked = !user.isBlocked;
    await user.save();

    res.status(200).json({ 
      message: `User ${user.isBlocked ? "blocked" : "unblocked"}`,
      user
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
