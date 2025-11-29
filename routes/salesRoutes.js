const express = require('express');
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");
const { getSales,getSalesbyID,addSales, updateSales, deleteSales, searchSales } = require("../controllers/salesController");

// Get all Sales
router.get("/sales",authMiddleware, getSales);

//search Customer 
router.get("/sales/search",authMiddleware,searchSales);

// Get Sales by ID
router.get("/sales/:id",authMiddleware, getSalesbyID);

// Add a new Sales
router.post("/sales",authMiddleware, addSales);

// Update Sales by ID
router.put("/sales/:id",authMiddleware, updateSales);

// Delete Sales by ID
router.delete("/sales/:id",authMiddleware, deleteSales);

module.exports=router;