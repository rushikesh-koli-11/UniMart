const mongoose = require("mongoose");

const offerSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    scopeType: {
      type: String,
      enum: ["category", "subcategory", "product", "cart"],
      required: true,
    },

    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", default: null },

    subcategoryId: { type: String, default: null }, 
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", default: null },

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
