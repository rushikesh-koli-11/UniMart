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
  try {
    const { q, category, subcategory } = req.query;

    const filter = {};

    // SEARCH
    if (q) {
      // find categories matching search
      const matchedCategories = await Category.find({
        name: { $regex: q, $options: "i" }
      }).distinct("_id");

      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "subcategory.name": { $regex: q, $options: "i" } },
        { category: { $in: matchedCategories } }
      ];
    }

    // CATEGORY filter
    if (category) {
      filter.category = category;
    }

    // SUBCATEGORY filter
    if (subcategory) {
      filter["subcategory._id"] = subcategory;
    }

    const products = await Product.find(filter)
      .populate("category")
      .limit(200);

    res.json(products);

  } catch (err) {
    console.error("Products load error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.addReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const productId = req.params.id;

    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: "Product not found" });

    // Optional: prevent multiple reviews by same user
    const already = product.reviews.find(r => r.user.toString() === req.user._id);
    if (already) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating,
      comment
    };

    product.reviews.push(review);

    // ⭐ Recalculate average rating
    product.avgRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) / product.reviews.length;

    await product.save();

    res.json({ message: "Review added", reviews: product.reviews, avgRating: product.avgRating });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    const product = await Product.findById(id);
    if (!product)
      return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review)
      return res.status(404).json({ message: "Review not found" });

    // ⭐ USER: allow only if review owner matches
    // ⭐ ADMIN: always allowed
    if (!req.user.isAdmin && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "You are not allowed to delete this review" });
    }

    // ⭐ REMOVE REVIEW (safe for Mongoose 7+)
    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId
    );

    // Recalculate avg rating
    if (product.reviews.length > 0) {
      product.avgRating =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length;
    } else {
      product.avgRating = 0;
    }

    await product.save();

    res.json({
      message: "Review deleted",
      reviews: product.reviews,
      avgRating: product.avgRating,
    });

  } catch (err) {
    console.log("DELETE REVIEW ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
