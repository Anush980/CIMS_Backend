const express = require("express");
const { getItems, getItemByID, addItem, updateItem, deleteItem } = require("../controllers/inventoryController");
const router = express.Router();

// Get all Items
router.get("/inventory", getItems);

// Get Item by ID
router.get("/inventory/:id", getItemByID);

// Add a new Item
router.post("/inventory", addItem);

// Update Item by ID
router.put("/inventory/:id", updateItem);

// Delete Item by ID
router.delete("/inventory/:id", deleteItem);

module.exports = router;
