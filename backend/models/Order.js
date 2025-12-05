const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: Number,
      price: Number
    }
  ],

  total: Number,

  paymentStatus: {
    type: String,
    enum: ["pending", "paid", "failed"],
    default: "pending",
  },

  status: {
    type: String,
    enum: ["processing", "packed", "shipped", "delivered", "cancelled"],
    default: "processing",
  },

  paymentDetails: {},

  shippingInfo: {
    name: { type: String, required: true },
    surname: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
  },

  createdAt: { type: Date, default: Date.now },
  deliveredAt: { type: Date },
});

module.exports = mongoose.model("Order", orderSchema);
