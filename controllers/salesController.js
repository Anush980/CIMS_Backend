const Sales = require('../models/Sales');
const Item = require('../models/Item');
const Customer = require('../models/Customer');

// Add a new sale (staff + admin)
const addSales = async (req, res) => {
  try {
    const { customerId, walkInCustomer, items, discount = 0, paymentType = 'cash' } = req.body;

    if (!items || !items.length) return res.status(400).json({ error: "Items are required for a sale" });

    let customer = null;
    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, userId: req.user.id });
      if (!customer) return res.status(400).json({ error: "Customer not found" });
    }

    let total = 0;
    for (let i = 0; i < items.length; i++) {
      const { product: itemId, quantity } = items[i];
      const item = await Item.findOne({ _id: itemId, userId: req.user.id });
      if (!item) return res.status(400).json({ error: `Item not found: ${itemId}` });
      if (item.stock < quantity) return res.status(400).json({ error: `Not enough stock for ${item.itemName}` });

      items[i].price = item.price;
      total += item.price * quantity;
    }

    total -= discount;

    const sale = await Sales.create({
      userId: req.user.id,
      customerId: customer ? customer._id : null,
      walkInCustomer: customer ? null : walkInCustomer || "Walk-in",
      items,
      discount,
      total,
      paymentType,
    });

    for (let i = 0; i < items.length; i++) {
      await Item.findByIdAndUpdate(items[i].product, { $inc: { stock: -items[i].quantity } });
    }

    if (paymentType === "credit" && customer) {
      customer.creditBalance += total;
      await customer.save();
    }

    res.status(201).json(sale);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

// Get all sales (staff + admin)
const getSales = async (req, res) => {
  try {
    const sales = await Sales.find({ userId: req.user.id }).populate("items.product", "itemName sku image");
    res.status(200).json(sales);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get sale by ID (staff + admin)
const getSalesbyID = async (req, res) => {
  try {
    const sale = await Sales.findOne({ _id: req.params.id, userId: req.user.id })
      .populate("items.product", "itemName sku");
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Update sale (admin only)
const updateSales = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const sale = await Sales.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Delete sale (admin only)
const deleteSales = async (req, res) => {
  if (req.user.role !== "admin") return res.status(403).json({ message: "Access denied" });

  try {
    const sale = await Sales.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
    if (!sale) return res.status(404).json({ error: "Sale not found" });
    res.status(200).json(sale);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

// Search sales (staff + admin)
const searchSales = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const results = await Sales.find({
      userId: req.user.id,
      $or: [
        { walkInCustomer: { $regex: q, $options: "i" } }
      ]
    });
    res.status(200).json(results);
  } catch (err) {
    res.status(500).json({ error: "Server Error" });
  }
};

module.exports = { addSales, getSales, getSalesbyID, updateSales, deleteSales, searchSales };
