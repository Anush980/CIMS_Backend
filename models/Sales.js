const mongoose = require("mongoose");

const salesSchema = new mongoose.Schema(
  {
    customer: {
      type: String,
      required: true,
      trim: true,
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
      enum: ["cash", "credit", "half"],
      default: "cash",
    },
  },
  { timestamps: true }
);
salesSchema.index({
  customer:"text",
})

module.exports = mongoose.model("Sales", salesSchema);
