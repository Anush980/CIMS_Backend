const express = require("express");
const {
  getItems,
  getItemByID,
  addItem,
  updateItem,
  deleteItem
} = require("../controllers/inventoryController");
const authMiddleware = require("../middleware/authMiddleware");
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();

// Routes
router.get("/inventory", authMiddleware, getItems);
router.get("/inventory/:id", authMiddleware, getItemByID);

// Add item (staff + admin)
router.post("/inventory", authMiddleware, upload.single("image"), addItem);

// Update / Delete (admin only)
router.put("/inventory/:id", authMiddleware, upload.single("image"), updateItem);
router.delete("/inventory/:id", authMiddleware, deleteItem);

module.exports = router;
