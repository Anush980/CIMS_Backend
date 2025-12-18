const Customer = require("../models/Customer");

// Add Customer (accessible by admin and staff)
const addCustomer = async (req, res) => {
  try {
    const customer = await Customer.create({
      userId: req.user.id,   
      ...req.body,
    });

    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

// Get Customers (accessible by admin and staff)
const getCustomers = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let query = { userId: req.user.id };

    if (search) {
      const orConditions = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerAddress: { $regex: search, $options: "i" } },
      ];

      if (!isNaN(Number(search))) {
        orConditions.push({ customerPhone: Number(search) });
      }

      query.$or = orConditions;
    }

    let customersQuery = Customer.find(query);

    if (sort === "recent") {
      customersQuery = customersQuery.sort({ createdAt: -1 });
    } else if (sort === "oldest") {
      customersQuery = customersQuery.sort({ createdAt: 1 });
    } else {
      customersQuery = customersQuery.sort({ _id: -1 });
    }

    const customers = await customersQuery;
    res.status(200).json(customers);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

// Get Customer by ID (accessible by admin and staff)
const getCustomerById = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!customer) return res.status(404).json({ Error: "Not Found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

// Update Customer (admin only)
const updateCustomer = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ Error: "Access denied. Admins only." });
    }

    const customer = await Customer.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );

    if (!customer) return res.status(404).json({ Error: "Not Found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

// Delete Customer (admin only)
const deleteCustomer = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ Error: "Access denied. Admins only." });
    }

    const customer = await Customer.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!customer) return res.status(404).json({ Error: "Not Found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ Error: err.message });
  }
};

module.exports = {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
