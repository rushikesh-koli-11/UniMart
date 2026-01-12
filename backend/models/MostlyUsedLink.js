const mongoose = require("mongoose");

const MostlyUsedLinkSchema = new mongoose.Schema(
  {
    logo: { type: String, required: true }, 
    link: { type: String, required: true },
    order: { type: Number, default: 0 }
  },
  { timestamps: true }
);

module.exports = mongoose.model("MostlyUsedLink", MostlyUsedLinkSchema);
