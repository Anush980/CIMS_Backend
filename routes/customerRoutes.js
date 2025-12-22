const express = require("express");
const { getCustomers, getCustomerById, addCustomer, updateCustomer, deleteCustomer } = require("../controllers/customerController");
const authMiddleware = require("../middleware/authMiddleware");
const {checkRole,checkStaffPermission}= require('../middleware/roleMiddleware.js');
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const router = express.Router();
// Get all customers
router.get("/customers", authMiddleware,checkRole(["admin", "owner", "staff"]), getCustomers);


// Add a new customer
router.post("/customers", authMiddleware,checkRole(["admin", "owner", "staff"]), upload.single("image"),addCustomer);

// Get customer by ID
router.get("/customers/:id", authMiddleware, checkRole(["admin", "owner", "staff"]), checkStaffPermission("canEdit"), getCustomerById);

// Update customer by ID
router.put("/customers/:id", authMiddleware, checkRole(["admin", "owner", "staff"]), checkStaffPermission("canEdit"),upload.single("image"), updateCustomer);

// Delete customer by ID
router.delete("/customers/:id", authMiddleware, checkRole(["admin", "owner", "staff"]), checkStaffPermission("canDelete"), deleteCustomer);




module.exports = router;    
