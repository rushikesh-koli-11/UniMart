const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  description: String,

  image: {
    url: String,
    public_id: String,
  },

  // Category-level offer
  offer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Offer",
    default: null,
  },

  // Subcategories inside category
  subcategories: [
    {
      _id: { type: String }, // Make sure subcategories are created with a unique string ID
      name: { type: String, required: true },
      description: String,
      image: {
        url: String,
        public_id: String,
      },
      offer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Offer",
        default: null,
      },
    },
  ],

  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Category", categorySchema);
