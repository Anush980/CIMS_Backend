const Customer = require("../models/Customer");

// Add Customer
const addCustomer = async (req, res) => {
  try {
    const customer = await Customer.create(req.body);
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Get Customers (with search + sort + optional category)
const getCustomers = async (req, res) => {
  try {
    const { search, sort } = req.query;
    let query = {};

    // Search filter
    if (search) {
      const orConditions = [
        { customerName: { $regex: search, $options: "i" } },
        { customerEmail: { $regex: search, $options: "i" } },
        { customerAddress: { $regex: search, $options: "i" } },
      ];

      // If search looks like a number, include phone
      if (!isNaN(Number(search))) {
        orConditions.push({ customerPhone: Number(search) });
      }

      query.$or = orConditions;
    }

    let customersQuery = Customer.find(query);

    // Sorting
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
    res.status(400).json({ error: err.message });
  }
};

// Get Customer by ID
const getCustomerById = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await Customer.findById(id);
    if (!customer) return res.status(404).json({ error: "Not Found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update Customer
const updateCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await Customer.findByIdAndUpdate(id, req.body, {
      new: true,
    });
    if (!customer) return res.status(404).json({ error: "Not Found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete Customer
const deleteCustomer = async (req, res) => {
  try {
    const id = req.params.id;
    const customer = await Customer.findByIdAndDelete(id);
    if (!customer) return res.status(404).json({ error: "Not Found" });
    res.status(200).json(customer);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = {
  addCustomer,
  getCustomers,
  getCustomerById,
  updateCustomer,
  deleteCustomer,
};
