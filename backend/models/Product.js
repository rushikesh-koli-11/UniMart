// backend/models/Product.js
const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: String,
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },

  images: [{ url: String, public_id: String }],

  category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },

  subcategory: { _id: String, name: String },

  stock: { type: Number, default: 0 },

  // ⭐ REVIEWS
  reviews: [reviewSchema],
  avgRating: { type: Number, default: 0 },
  numReviews: { type: Number, default: 0 },

  // ⭐ OFFER REF
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: null,
  },

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Product", productSchema);
