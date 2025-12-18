const Item = require("../models/Item");
const cloudinary = require("../config/cloudinary");

const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1758189840/inventory/rgwniiqhjknsuuapvjpx.jpg`;

// Add item (staff + admin)
const addItem = async (req, res) => {
  try {
    const streamifier = require("streamifier");
    let imageUrl = DEFAULT_IMAGE_URL;

    if (req.file) {
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
      userId: req.user.id,
      ...req.body,
      image: imageUrl,
    });

    res.status(201).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

// Get all items (any role)
const getItems = async (req, res) => {
  try {
    const { search, sort, category, stock } = req.query;
    let query = { userId: req.user.id };

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    if (category) query.category = category;

    if (stock === "low") query.stock = { $gt: 0, $lte: 5 };
    else if (stock === "out") query.stock = 0;

    let inventoryQuery = Item.find(query);

    if (!sort || sort === "latest") inventoryQuery = inventoryQuery.sort({ _id: -1 });
    else if (sort === "oldest") inventoryQuery = inventoryQuery.sort({ _id: 1 });

    const items = await inventoryQuery.exec();
    res.status(200).json(items);
  } catch (err) {
    res.status(500).json({ Error: "Internal Server Error" });
  }
};

// Get item by ID (any role)
const getItemByID = async (req, res) => {
  try {
    const item = await Item.findOne({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ Error: "Item not Found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

// Update item (admin only)
const updateItem = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const id = req.params.id;
    let updateData = { ...req.body };

    if (req.file) {
      const streamifier = require("streamifier");
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "inventory" },
          (error, result) => (error ? reject(error) : resolve(result.secure_url))
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });
      updateData.image = imageUrl;
    }

    const item = await Item.findOneAndUpdate({ _id: id, userId: req.user.id }, updateData, { new: true });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

// Delete item (admin only)
const deleteItem = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const item = await Item.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

module.exports = { addItem, getItems, getItemByID, updateItem, deleteItem };
