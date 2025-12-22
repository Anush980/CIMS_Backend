// src/models/Customer.js
const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {

 shopName: {
      type: String,
      required: true,
      index: true,
    },
    // Optional image URL or path
    image: {
      type: String,
    },
    // Customer full name
    customerName: {
      type: String,
      required: true,
      trim: true,
    },

    // Customer phone number
    customerPhone: {
      type: String, 
      required: true,
      trim: true,
    },

    // Optional customer email
    customerEmail: {
      type: String,
      trim: true,
      lowercase: true,
    },

    // Customer address
    customerAddress: {
      type: String,
      required: true,
      trim: true,
    },

    // Customer credit balance
    creditBalance: {
      type: Number,
      default: 0,
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

// Text index for search optimization
customerSchema.index({
  customerName: "text",
  customerEmail: "text",
  customerAddress: "text",
});

module.exports = mongoose.model("Customer", customerSchema);
