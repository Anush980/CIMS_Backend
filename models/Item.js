// src/models/Item.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
   
    shopName: {
      type: String,
      required: true,
      index: true,
    },

    // Name of the item
    itemName: {
      type: String,
      required: true,
      trim: true,
    },

    // Optional category
    category: {
      type: String,
      trim: true,
    },

    // Price of the item
    price: {
      type: Number,
      required: true,
      min: 0,
    },

    // SKU for item identification
    sku: {
      type: String,
      trim: true,
      unique: true, // optional but recommended for inventory tracking
      sparse: true, // allows multiple docs without SKU
    },

    // Current stock quantity
    stock: {
      type: Number,
      default: 1,
      min: 0,
    },

    // Threshold to restock
    restock: {
      type: Number,
      default: 5,
      min: 0,
    },

    // Optional image URL or path
    image: {
      type: String,
      default: "/default.jpg",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true, // adds createdAt and updatedAt automatically
  }
);

// Text index for fast search by itemName, category, or SKU
itemSchema.index({
  itemName: "text",
  category: "text",
  sku: "text",
});

module.exports = mongoose.model("Item", itemSchema);
