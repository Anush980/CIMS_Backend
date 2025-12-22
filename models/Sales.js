// src/models/Sales.js
const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {

   shopName: {
      type: String,
      required: true,
      index: true,
    },

    // Optional reference to a registered customer
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },

    // For walk-in customers
    walkInCustomer: {
      type: String,
      trim: true,
      default: "Walk-in",
    },

    // List of items in the sale
    items: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Item",
          required: true,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
        price: {
          type: Number,
          required: true,
        },
      },
    ],

    // Discount applied
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Total amount after discount
    total: {
      type: Number,
      required: true,
    },

    // Payment method
    paymentType: {
      type: String,
      enum: ["cash", "credit", "online"],
      default: "cash",
    },
     createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
  },
  
  {
    timestamps: true,
  }
);

// Index to enable fast search by walk-in customer name
salesSchema.index({
  walkInCustomer: "text",
});

module.exports = mongoose.model("Sales", salesSchema);
