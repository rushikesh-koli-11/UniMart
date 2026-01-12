const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
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

  subcategories: [
    {
      _id: { type: String }, 
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
