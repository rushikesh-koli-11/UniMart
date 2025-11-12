// backend/controllers/productController.js
const Product = require('../models/Product');
const Category = require('../models/Category');

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category, subcategory, images } = req.body;

    // Ensure category exists
    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ message: "Invalid category" });

    // Ensure subcategory exists inside category
    const sub = cat.subcategories.id(subcategory._id);
    if (!sub) return res.status(400).json({ message: "Invalid subcategory" });

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      category,
      subcategory: { _id: sub._id.toString(), name: sub.name },
      images
    });

    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category, subcategory, images } = req.body;

    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ message: "Invalid category" });

    const sub = cat.subcategories.id(subcategory._id);
    if (!sub) return res.status(400).json({ message: "Invalid subcategory" });

    const updated = await Product.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        price,
        stock,
        category,
        subcategory: { _id: sub._id.toString(), name: sub.name },
        images
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: 'Deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  const p = await Product.findById(req.params.id).populate('category');
  res.json(p);
};

exports.listProducts = async (req, res) => {
  const q = req.query.q || '';
  const regex = new RegExp(q, 'i');
  const products = await Product.find({
    $or: [{ title: regex }, { description: regex }]
  })
  .populate('category')
  .limit(100);
  res.json(products);
};
