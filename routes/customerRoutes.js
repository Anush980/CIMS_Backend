const express = require("express");
const { getCustomers, getCustomerById, addCustomer, updateCustomer, deleteCustomer } = require("../controllers/customerController");
const router = express.Router();

// Get all customers
router.get("/customer", getCustomers);

// Get customer by ID
router.get("/customer/:id", getCustomerById);

// Add a new customer
router.post("/customer", addCustomer);

// Update customer by ID
router.put("/customer/:id", updateCustomer);

// Delete customer by ID
router.delete("/customer/:id", deleteCustomer);

module.exports = router;
