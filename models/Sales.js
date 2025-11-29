const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Customer",
      default: null,
    },
    walkInCustomer: {
      type: String,
      trim: true,
      default: "Walk-in",
    },
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
    discount: {
      type: Number,
      default: 0,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
    },
    paymentType: {
      type: String,
      enum: ["cash","credit","online"],
      default: "cash",
    },
  },
  {
    timestamps: true,
  }
);
salesSchema.index({
  walkInCustomer: "text",
});

module.exports = mongoose.model("Sales", salesSchema);
