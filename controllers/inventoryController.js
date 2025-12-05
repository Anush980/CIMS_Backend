const Item = require("../models/Item");
const cloudinary = require("../config/cloudinary");
// const { memoryStorage } = require("multer");

const DEFAULT_IMAGE_URL = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload/v1758189840/inventory/rgwniiqhjknsuuapvjpx.jpg`;

//Add item
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
      userId: req.user.id, // PRIVATE OWNERSHIP
      ...req.body,
      image: imageUrl,
    });

    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

const getItems = async (req, res) => {
  try {
    const { search, sort, category, stock } = req.query;
    let query = { userId: req.user.id };

    // Search filter
    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { sku: { $regex: search, $options: "i" } },
      ];
    }

    // Category filter
    if (category) {
      query.category = category;
    }

    // Stock filter
    if (stock === "low") {
      query.stock = { $gt: 0, $lte: 5 }; // adjust 5 to your low-stock threshold
    } else if (stock === "out") {
      query.stock = 0;
    }

    // Build query
    let inventoryQuery = Item.find(query);

    // Sorting
    if (!sort || sort === "latest") {
      inventoryQuery = inventoryQuery.sort({ _id: -1 });
    } else if (sort === "oldest") {
      inventoryQuery = inventoryQuery.sort({ _id: 1 });
    } else {
      inventoryQuery = inventoryQuery.sort({ _id: -1 });
    }

    const items = await inventoryQuery.exec();
    res.status(200).json(items);
  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ Error: "Internal Server Error" });
  }
};


//get Item by ID
const getItemByID = async (req, res) => {
  try {
    const id = req.params.id;

    const item = await Item.findOne({
      _id: id,
      userId: req.user.id, 
    });

    if (!item) {
      return res.status(404).json({ Error: "Item not Found" });
    }

    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};


//update Item
const updateItem = async (req, res) => {
  try {
    const id = req.params.id;
    let updateData = { ...req.body }; // copy all fields from request body

    if (req.file) {
      const streamifier = require("streamifier");

      // Upload new image to Cloudinary
      const imageUrl = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: "inventory" },
          (error, result) => {
            if (error) return reject(error);
            resolve(result.secure_url);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(stream);
      });

      updateData.image = imageUrl; // update image field
    }

    // Update the item with new data
    const item = await Item.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      updateData,
      { new: true }
    );

    if (!item) return res.status(400).json({ error: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

//delete Item
const deleteItem = async (req, res) => {
  try {
    const id = req.params.id;
    const item = await Item.findOneAndDelete({
      _id: id,
      userId: req.user.id,
    });

    if (!item) return res.status(400).json({ error: "Item not found" });
    res.status(200).json(item);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

module.exports = { addItem, getItems, getItemByID, updateItem, deleteItem };
