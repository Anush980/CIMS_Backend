const express = require("express");
const { getItems, getItemByID, addItem, updateItem, deleteItem, searchItem, filterItemByCategory } = require("../controllers/inventoryController");
const router = express.Router();
const multer = require("multer");

const storage = multer.memoryStorage();
const upload = multer  ({storage});


// Get all Items
router.get("/inventory", getItems);

// Get Item by ID
router.get("/inventory/:id", getItemByID);

// Add a new Item
router.post("/inventory",upload.single("image"), addItem);

// Update Item by ID
router.put("/inventory/:id" ,upload.single("image"), updateItem);

// Delete Item by ID
router.delete("/inventory/:id", deleteItem);

module.exports = router;
