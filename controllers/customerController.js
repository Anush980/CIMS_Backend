// src/controllers/customerController.js
const Customer = require("../models/Customer");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { canAdd, canEdit, canDelete } = require("../utils/permissions");

const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1763129723/inventory/mg7cgrtt647e1qpbgxtk.png`;

// --- Add Customer ---
// Accessible by admin and staff (or owner if needed)
const addCustomer = async (req, res) => {
  if (!canAdd(req.user.role)) {
    return res.status(403).json({ message: "Access denied", type:"error" });
  }
  try {
    let imageUrl = DEFAULT_IMAGE_URL;

    if (req.file) {
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "customers" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    const customer = await Customer.create({
      shopName: req.user.shopName,
      createdBy: req.user._id,
      ...req.body, // expects customerName, customerPhone, etc.
      image: imageUrl,
    });

    res.status(201).json(customer);
  } catch (err) {
    console.error("Add Customer Error:", err);
    res.status(400).json({ message: err.message, type:"error" });
  }
};

// --- Get Customers ---
const getCustomers = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let query = { shopName: req.user.shopName };

    if (search) {
      const orConditions = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerAddress: { $regex: search, $options: "i" } },
      ];
      if (!isNaN(Number(search)))
        orConditions.push({ customerPhone: Number(search) });
      query.$or = orConditions;
    }

    let customersQuery = Customer.find(query);

    if (sort === "recent")
      customersQuery = customersQuery.sort({ createdAt: -1 });
    else if (sort === "oldest")
      customersQuery = customersQuery.sort({ createdAt: 1 });
    else customersQuery = customersQuery.sort({ _id: -1 });

    const customers = await customersQuery;
    res.status(200).json(customers);
  } catch (err) {
    console.error("Get Customers Error:", err);
    res.status(400).json({ message: err.message, type:"error" });
  }
};

// --- Get Customer By ID ---
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      shopName: req.user.shopName,
    });
    if (!customer) return res.status(404).json({ message: "Customer not found", type:"error" });
    res.status(200).json(customer);
  } catch (err) {
    console.error("Get Customer By ID Error:", err);
    res.status(400).json({ message: err.message, type:"error" });
  }
};

// --- Update Customer ---
const updateCustomer = async (req, res) => {
  try {
    // FIXED: Check permissions properly for staff
    if (req.user.role === "staff") {
      // Staff needs canEdit permission
      if (!req.user.permissions?.canEdit) {
        return res.status(403).json({ 
          message: "You don't have permission to edit customers. Contact admin." , type:"error"
        });
      }
    } else if (!canEdit(req.user.role)) {
      // For non-staff roles, use the canEdit function
      return res.status(403).json({ 
        message: "Access denied" , type:"error"
      });
    }

    let updateData = { ...req.body };

    if (req.file) {
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "customers" },
          (error, result) =>
            error ? reject(error) : resolve(result.secure_url)
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      updateData.image = imageUrl;
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, shopName: req.user.shopName },
      updateData,
      { new: true }
    );

    if (!customer) return res.status(404).json({ message: "Customer not found", type:"error" });
    res.status(200).json(customer);
  } catch (err) {
    console.error("Update Customer Error:", err);
    res.status(400).json({ message: err.message, type:"error" });
  }
};

// --- Delete Customer ---
const deleteCustomer = async (req, res) => {
  try {
    // FIXED: Check permissions properly for staff
    if (req.user.role === "staff") {
      // Staff needs canDelete permission
      if (!req.user.permissions?.canDelete) {
        return res.status(403).json({ 
          message: "You don't have permission to delete customers. Contact admin." , type:"error"
        });
      }
    } else if (!canDelete(req.user.role)) {
      // For non-staff roles, use the canDelete function
      return res.status(403).json({ 
        message: "Access denied" , type:"error"
      });
    }

    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      shopName: req.user.shopName,
    });

    if (!customer) return res.status(404).json({ error: "Customer not found" });
    res.status(200).json({ message: "Customer deleted successfully" , type:"success"});
  } catch (err) {
    console.error("Delete Customer Error:", err);
    res.status(400).json({ error: err.message, type:"error" });
  }
};

module.exports = {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};