const express = require('express');
const router = express.Router();
const { getSales,getSalesbyID,addSales, updateSales, deleteSales, searchSales } = require("../controllers/salesController");

// Get all Sales
router.get("/sales", getSales);

//search Customer 
router.get("/sales/search",searchSales);

// Get Sales by ID
router.get("/sales/:id", getSalesbyID);

// Add a new Sales
router.post("/sales", addSales);

// Update Sales by ID
router.put("/sales/:id", updateSales);

// Delete Sales by ID
router.delete("/sales/:id", deleteSales);

module.exports=router;