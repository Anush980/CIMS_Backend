const express = require("express");
const { getCustomers, getCustomerById, addCustomer, updateCustomer, deleteCustomer, searchCustomer } = require("../controllers/customerController");
const router = express.Router();
const authMiddleware = require("../middleware/authMiddleware");

// Get all customers
router.get("/customers", authMiddleware, getCustomers);


// Add a new customer
router.post("/customers", authMiddleware, addCustomer);

// Get customer by ID
router.get("/customers/:id", authMiddleware, getCustomerById);

// Update customer by ID
router.put("/customers/:id", authMiddleware, updateCustomer);

// Delete customer by ID
router.delete("/customers/:id", authMiddleware, deleteCustomer);



module.exports = router;    
