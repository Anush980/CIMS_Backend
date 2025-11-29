const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    itemName: {
      type: String,
      required: true,
    },
    category: {
      type: String,
    },
    price: {
      type: Number,
      required: true,
    },
    sku: {
      type: String,
    },
    stock: {
      type: Number,
      default: 1,
    },
    restock: {
      type: Number,
      default: 5,
    },

    image: {
      type: String,
      default: "/default.jpg",
    },
  },
  {
    timestamps: true,
  }
);

itemSchema.index({
  itemName: "text",
  category: "text",
  sku: "text",
});
module.exports = mongoose.model("Item", itemSchema);
