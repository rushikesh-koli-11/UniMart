// backend/models/Offer.js
const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    // category | subcategory | product | cart
    scopeType: {
      type: String,
      enum: ["category", "subcategory", "product", "cart"],
      required: true,
    },

    // If scope = category
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },

    // If scope = subcategory (stored as nested ID inside Category)
    subcategoryId: { type: String, default: null }, // use string _id

    // If scope = product
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },

    // Discount
    discountType: { type: String, enum: ["percentage", "flat"], required: true },
    discountValue: { type: Number, required: true },

    minCartAmount: { type: Number, default: 0 },
    minMrp: { type: Number, default: 0 },

    couponCode: { type: String, trim: true },
    autoApply: { type: Boolean, default: true },
    active: { type: Boolean, default: true },

    startDate: { type: Date, default: Date.now },
    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Offer", offerSchema);
