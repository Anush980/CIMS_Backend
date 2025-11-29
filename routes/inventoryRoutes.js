const express = require("express");
const { getItems, getItemByID, addItem, updateItem, deleteItem, searchItem, filterItemByCategory } = require("../controllers/inventoryController");
const authMiddleware = require("../middleware/authMiddleware");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer  ({storage});


// Get all Items
router.get("/inventory",authMiddleware, getItems);

// Get Item by ID
router.get("/inventory/:id",authMiddleware, getItemByID);

// Add a new Item
router.post("/inventory",upload.single("image"), authMiddleware,addItem);

// Update Item by ID
router.put("/inventory/:id" ,upload.single("image"),authMiddleware, updateItem);

// Delete Item by ID
router.delete("/inventory/:id",authMiddleware, deleteItem);

module.exports = router;
