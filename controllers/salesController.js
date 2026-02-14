const Sales = require('../models/Sales');
const Item = require('../models/Item');
const Customer = require('../models/Customer');
const { canAdd, canEdit, canDelete } = require("../utils/permissions");

// --- ADD NEW SALE ---
const addSales = async (req, res) => {
  if (!canAdd(req.user.role)) {
    return res.status(403).json({ message: "Access denied" , type:"error"});
  }
  try {
    const { customerId, walkInCustomer, items, discount = 0, paymentType = 'cash' } = req.body;

    if (!items || !items.length) return res.status(400).json({ message: "Items are required for a sale",type:"info" });

    // Validate customer if provided
    let customer = null;
    if (customerId) {
      customer = await Customer.findOne({ _id: customerId, shopName: req.user.shopName });
      if (!customer) return res.status(400).json({ message: "Customer not found" , type:"error"});
    }

    // Calculate total & validate stock
    let total = 0;
    for (let i = 0; i < items.length; i++) {
      const { product: itemId, quantity } = items[i];
      const item = await Item.findOne({ _id: itemId, shopName: req.user.shopName });
      if (!item) return res.status(400).json({ message: `Item not found: ${itemId}` , type:"error" });
      if (item.stock < quantity) return res.status(400).json({ message: `Not enough stock for ${item.itemName}`,type:"error" });
      items[i].price = item.price; // attach price at time of sale
      total += item.price * quantity;
    }

    total -= discount;

    // Create sale record
    const sale = await Sales.create({
      shopName: req.user.shopName,
      createdBy: req.user._id,
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
    res.status(500).json({ message: err.message , type:"error"});
  }
};

// --- GET ALL SALES ---

const getSales = async (req, res) => {
  try {
    const sales = await Sales.find({ shopName: req.user.shopName })
      .populate("items.product", "itemName sku image")
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json(sales);
  } catch (err) {
    console.error("Get Sales Error:", err);
    res.status(500).json({ message: err.message, type: "error" });
  }
};


// --- GET SALE BY ID ---
const getSalesbyID = async (req, res) => {
  try {
    const sale = await Sales.findOne({ _id: req.params.id, shopName: req.user.shopName }).populate("items.product", "itemName sku");
    if (!sale) return res.status(404).json({ message: "Sale not found" , type:"error"});
    res.status(200).json(sale);
  } catch (err) {
    console.error("Get Sale By ID Error:", err);
    res.status(400).json({ message: err.message, type:"error" });
  }
};

// --- UPDATE SALE ---
const updateSales = async (req, res) => {
  try {
    // FIXED: Check permissions properly for staff
    if (req.user.role === "staff") {
      // Staff needs canEdit permission
      if (!req.user.permissions?.canEdit) {
        return res.status(403).json({ 
          message: "You don't have permission to edit sales. Contact shop owner." , type:"error"
        });
      }
    } else if (!canEdit(req.user.role)) {
      // For non-staff roles, use the canEdit function
      return res.status(403).json({ 
        message: "Access denied" , type:"error"
      });
    }

    const sale = await Sales.findOneAndUpdate(
      { _id: req.params.id, shopName: req.user.shopName }, 
      req.body, 
      { new: true }
    );

    if (!sale) return res.status(404).json({ message: "Sale not found", type:"error" });
    res.status(200).json(sale);
  } catch (err) {
    console.error("Update Sale Error:", err);
    res.status(400).json({ message: err.message, type:"error" });
  }
};

// --- DELETE SALE ---
const deleteSales = async (req, res) => {
  try {
    // FIXED: Check permissions properly for staff
    if (req.user.role === "staff") {
      // Staff needs canDelete permission
      if (!req.user.permissions?.canDelete) {
        return res.status(403).json({ 
          message: "You don't have permission to delete sales. Contact shop owner." , type:"error"
        });
      }
    } else if (!canDelete(req.user.role)) {
      // For non-staff roles, use the canDelete function
      return res.status(403).json({ 
        message: "Access denied" , type:"error"
      });
    }

    const sale = await Sales.findOneAndDelete({ 
      _id: req.params.id, 
      shopName: req.user.shopName 
    });

    if (!sale) return res.status(404).json({ message: "Sale not found" , type:"error"});
    
    res.status(200).json({ message: "Sale deleted successfully" , type:"success"});
  } catch (err) {
    console.error("Delete Sale Error:", err);
    res.status(400).json({ message: err.message , type:"error"});
  }
};

// --- SEARCH SALES ---
const searchSales = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    
    const results = await Sales.find({
      shopName: req.user.shopName,
      $or: [{ walkInCustomer: { $regex: q, $options: "i" } }],
    });
    
    res.status(200).json(results);
  } catch (err) {
    console.error("Search Sales Error:", err);
    res.status(500).json({ message: "Server Error", type:"error" });
  }
};

module.exports = { addSales, getSales, getSalesbyID, updateSales, deleteSales, searchSales };