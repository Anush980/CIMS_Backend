// src/controllers/inventoryController.js
const Item = require("../models/Item");
const cloudinary = require("../config/cloudinary");
const streamifier = require("streamifier");
const { canAdd, canEdit, canDelete } = require("../utils/permissions");

const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1758189840/inventory/rgwniiqhjknsuuapvjpx.jpg`;

// --- Add Item ---
const addItem = async (req, res) => {
  if (!canAdd(req.user.role)) {
    return res.status(403).json({ message: "Access denied", type:"error" });
  }
  try {
    let imageUrl = DEFAULT_IMAGE_URL;

    if (req.file) {
      // Upload image to Cloudinary
      imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "inventory" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
    }

    const item = await Item.create({
      shopName: req.user.shopName,
      createdBy: req.user._id,
      ...req.body,
      image: imageUrl,
    });

    res.status(201).json(item);
  } catch (err) {
    console.error("Add Item Error:", err);
    res.status(400).json({ message: err.message , type:"error"});
  }
};

// --- Get Items ---
const getItems = async (req, res) => {
  try {
    const { search, sort, category, stock } = req.query;
    let query = { shopName: req.user.shopName };

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;
    if (stock === "low") query.stock = { $gt: 0, $lte: 5 };
    else if (stock === "out") query.stock = 0;

    let itemsQuery = Item.find(query);

    if (!sort || sort === "recent") itemsQuery = itemsQuery.sort({ _id: -1 });
    else if (sort === "oldest") itemsQuery = itemsQuery.sort({ _id: 1 });

    const items = await itemsQuery.exec();
    res.status(200).json(items);
  } catch (err) {
    console.error("Get Items Error:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

// --- Get Item by ID ---
const getItemByID = async (req, res) => {
  try {
    const item = await Item.findOne({
      _id: req.params.id,
      shopName: req.user.shopName,
    });
    if (!item) return res.status(404).json({ message: "Item not found", type:"error" });
    res.status(200).json(item);
  } catch (err) {
    console.error("Get Item By ID Error:", err);
    res.status(400).json({ message: err.message, type:"error" });
  }
};

// --- Update Item ---
const updateItem = async (req, res) => {
  try {
    // FIXED: Check permissions properly for staff
    if (req.user.role === "staff") {
      // Staff needs canEdit permission
      if (!req.user.permissions?.canEdit) {
        return res.status(403).json({ 
          message: "You don't have permission to edit inventory items. Contact admin.", type:"error" 
        });
      }
    } else if (!canEdit(req.user.role)) {
      // For non-staff roles, use the canEdit function
      return res.status(403).json({ 
        message: "Access denied" , type:"error"
      });
    }

    const id = req.params.id;
    let updateData = { ...req.body };

    if (req.file) {
      // Upload new image to Cloudinary
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "inventory" },
          (error, result) =>
            error ? reject(error) : resolve(result.secure_url)
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      updateData.image = imageUrl;
    }

    const item = await Item.findOneAndUpdate(
      { _id: id, shopName: req.user.shopName },
      updateData,
      { new: true }
    );

    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    console.error("Update Item Error:", err);
    res.status(400).json({ message: err.message , type:"error"});
  }
};

// --- Delete Item ---
const deleteItem = async (req, res) => {
  try {
    // FIXED: Check permissions properly for staff
    if (req.user.role === "staff") {
      // Staff needs canDelete permission
      if (!req.user.permissions?.canDelete) {
        return res.status(403).json({ 
          message: "You don't have permission to delete inventory items. Contact shop owner." , type:"error"
        });
      }
    } else if (!canDelete(req.user.role)) {
      // For non-staff roles, use the canDelete function
      return res.status(403).json({ 
        message: "Access denied" , type:"error"
      });
    }

    const item = await Item.findOneAndDelete({
      _id: req.params.id,
      shopName: req.user.shopName,
    });

    if (!item) return res.status(404).json({ error: "Item not found" });
    
    res.status(200).json({ message: "Item deleted successfully", type:"success" });
  } catch (err) {
    console.error("Delete Item Error:", err);
    res.status(400).json({ error: err.message });
  }
};

module.exports = { addItem, getItems, getItemByID, updateItem, deleteItem };