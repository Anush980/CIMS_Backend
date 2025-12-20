const Sales = require('../models/Sales');
const Item = require('../models/Item');
const Customer = require('../models/Customer');
const { canAdd, canEdit, canDelete } = require("../utils/permissions");


// --- ADD NEW SALE ---
const addSales = async (req, res) => {
if (!canAdd(req.user.role)) {
  return res.status(403).json({ message: "Access denied" });
}
  try {
    const { customerId, walkInCustomer, items, discount = 0, paymentType = 'cash' } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: "Items are required for a sale" });

    // Validate customer if provided
    let customer = null;
    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, userId: req.user.id });
      if (!customer) return res.status(400).json({ error: "Customer not found" });
    }

    // Calculate total & validate stock
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      const { product: itemId, quantity } = items[i];
      const item = await Item.findOne({ _id: itemId, userId: req.user.id });
      if (!item) return res.status(400).json({ error: `Item not found: ${itemId}` });
      if (item.stock < quantity) return res.status(400).json({ error: `Not enough stock for ${item.itemName}` });

      items[i].price = item.price; // attach price at time of sale
      total += item.price * quantity;
    }

    total -= discount;

    // Create sale record
    const sale = await Sales.create({
      userId: req.user.id,
      customerId: customer ? customer._id : null,
      walkInCustomer: customer ? null : walkInCustomer || "Walk-in",
      items,
      discount,
      total,
      paymentType,
    });

    // Deduct stock from inventory
    for (let i = 0; i < items.length; i++) {
      await Item.findByIdAndUpdate(items[i].product, { $inc: { stock: -items[i].quantity } });
    }

    // Add credit if applicable
    if (paymentType === "credit" && customer) {
      customer.creditBalance += total;
      await customer.save();
    }

    res.status(201).json(sale);
  } catch (err) {
    console.error("Add Sales Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- GET ALL SALES ---
const getSales = async (req, res) => {
  
  try {
    const sales = await Sales.find({ userId: req.user.id }).populate("items.product", "itemName sku image");
    res.status(200).json(sales);
  } catch (err) {
    console.error("Get Sales Error:", err);
    res.status(500).json({ error: err.message });
  }
};

// --- GET SALE BY ID ---
const getSalesbyID = async (req, res) => {
  try {
    const sale = await Sales.findOne({ _id: req.params.id, userId: req.user.id }).populate("items.product", "itemName sku");
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(sale);
  } catch (err) {
    console.error("Get Sale By ID Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// --- UPDATE SALE ---
const updateSales = async (req, res) => {

 if (!canEdit(req.user.role)) {
  return res.status(403).json({ message: "Only admin or owner can update items" });
}

  try {
    const sale = await Sales.findOneAndUpdate({ _id: req.params.id, userId: req.user.id }, req.body, { new: true });
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(sale);
  } catch (err) {
    console.error("Update Sale Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// --- DELETE SALE ---

const deleteSales = async (req, res) => {
  
  if (!canDelete(req.user.role)) {
  return res.status(403).json({ message: "Only admin or owner can delete items" });
}
  try {
    const sale = await Sales.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(sale);
  } catch (err) {
    console.error("Delete Sale Error:", err);
    res.status(400).json({ error: err.message });
  }
};

// --- SEARCH SALES ---
// Staff + admin
const searchSales = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const results = await Sales.find({
      userId: req.user.id,
      $or: [{ walkInCustomer: { $regex: q, $options: "i" } }],
    });
    res.status(200).json(results);
  } catch (err) {
    console.error("Search Sales Error:", err);
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { addSales, getSales, getSalesbyID, updateSales, deleteSales, searchSales };
