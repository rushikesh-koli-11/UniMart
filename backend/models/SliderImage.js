const mongoose = require("mongoose");

const SliderImageSchema = new mongoose.Schema(
  {
    imageUrl: { type: String, required: true },
    order: { type: Number, default: 0 },
    link: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("SliderImage", SliderImageSchema);
