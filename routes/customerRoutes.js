const express = require("express");
const { getCustomers, getCustomerById, addCustomer, updateCustomer, deleteCustomer, searchCustomer } = require("../controllers/customerController");
const router = express.Router();

// Get all customers
router.get("/customer", getCustomers);

// Add a new customer
router.post("/customer", addCustomer);

//search Customer by all
router.get("/customer/search",searchCustomer);


// Get customer by ID
router.get("/customer/:id", getCustomerById);


// Update customer by ID
router.put("/customer/:id", updateCustomer);

// Delete customer by ID
router.delete("/customer/:id", deleteCustomer);



module.exports = router;    
