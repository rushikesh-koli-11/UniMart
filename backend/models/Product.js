const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  images: [{ url: String, public_id: String }],

  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },

  subcategory: {
    _id: String,
    name: String
  },

  stock: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Product', productSchema);
