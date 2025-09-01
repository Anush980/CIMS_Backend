const express = require('express');
const router = express.Router();
const { getSales,getSalesbyID,addSales, updateSales, deleteSales } = require("../controllers/salesController");

// Get all Sales
router.get("/sales", getSales);

// Get Sales by ID
router.get("/sales/:id", getSalesbyID);

// Add a new Sales
router.post("/sales", addSales);

// Update Sales by ID
router.put("/sales/:id", updateSales);

// Delete Sales by ID
router.delete("/sales/:id", deleteSales);

module.exports=router;