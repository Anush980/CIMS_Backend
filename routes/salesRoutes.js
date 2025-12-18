const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const {
  getSales,
  getSalesbyID,
  addSales,
  updateSales,
  deleteSales,
  searchSales
} = require("../controllers/salesController");

// Public for logged-in users
router.get("/sales", authMiddleware, getSales);
router.get("/sales/search", authMiddleware, searchSales);
router.get("/sales/:id", authMiddleware, getSalesbyID);

// Add sale (staff + admin)
router.post("/sales", authMiddleware, addSales);

// Update / Delete sale (admin only)
router.put("/sales/:id", authMiddleware, updateSales);
router.delete("/sales/:id", authMiddleware, deleteSales);

module.exports = router;
