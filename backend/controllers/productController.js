const Product = require("../models/Product");
const Category = require("../models/Category");

exports.createProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category, subcategory, images, offer } = req.body;

    const cat = await Category.findById(category);
    if (!cat) return res.status(400).json({ message: "Invalid category" });

    const sub = cat.subcategories.id(subcategory._id);
    if (!sub) return res.status(400).json({ message: "Invalid subcategory" });

    const product = await Product.create({
      title,
      description,
      price,
      stock,
      category,
      subcategory: { _id: sub._id.toString(), name: sub.name },
      images,
      offer: offer || null,
    });

    res.json(product);
  } catch (err) {
    console.error("Create product error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const { title, description, price, stock, category, subcategory, images, offer } = req.body;

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
        images,
        offer: offer || null,
      },
      { new: true }
    );

    res.json(updated);
  } catch (err) {
    console.error("Update product error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    await Product.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
  } catch (err) {
    console.error("Delete product error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.getProduct = async (req, res) => {
  try {
    const p = await Product.findById(req.params.id)
      .populate("category")
      .populate("offer");
    res.json(p);
  } catch (err) {
    console.error("Get product error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.listProducts = async (req, res) => {
  try {
    const { q, category, subcategory, sort, limit } = req.query;

    const filter = {};

    // SEARCH
    if (q) {
      const matchedCategories = await Category.find({
        name: { $regex: q, $options: "i" },
      }).distinct("_id");

      filter.$or = [
        { title: { $regex: q, $options: "i" } },
        { description: { $regex: q, $options: "i" } },
        { "subcategory.name": { $regex: q, $options: "i" } },
        { category: { $in: matchedCategories } },
      ];
    }

    if (category) {
      filter.category = category;
    }

    if (subcategory) {
      filter["subcategory._id"] = subcategory;
    }

    if (sort === "offers") {
      filter.offer = { $ne: null };
    }

    let query = Product.find(filter).populate("category").populate("offer");

    if (sort === "top-rated") {
      query = query.sort({ avgRating: -1, numReviews: -1, createdAt: -1 });
    } else if (sort === "trending") {
      query = query.sort({ numReviews: -1, avgRating: -1, createdAt: -1 });
    } else if (sort === "new") {
      query = query.sort({ createdAt: -1 });
    } else {
      query = query.sort({ createdAt: -1 });
    }

    const max = Number(limit) || 200;
    const products = await query.limit(max);

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

    const already = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );
    if (already) {
      return res.status(400).json({ message: "You already reviewed this product" });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating,
      comment,
    };

    product.reviews.push(review);

    product.numReviews = product.reviews.length;
    product.avgRating =
      product.reviews.reduce((acc, r) => acc + r.rating, 0) /
      product.reviews.length;

    await product.save();

    res.json({
      message: "Review added",
      reviews: product.reviews,
      avgRating: product.avgRating,
      numReviews: product.numReviews,
    });
  } catch (err) {
    console.error("Add review error:", err);
    res.status(500).json({ message: err.message });
  }
};

exports.deleteReview = async (req, res) => {
  try {
    const { id, reviewId } = req.params;

    const product = await Product.findById(id);
    if (!product) return res.status(404).json({ message: "Product not found" });

    const review = product.reviews.id(reviewId);
    if (!review) return res.status(404).json({ message: "Review not found" });

    if (
      !req.user.isAdmin &&
      review.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "You are not allowed to delete this review" });
    }

    product.reviews = product.reviews.filter(
      (r) => r._id.toString() !== reviewId
    );

    if (product.reviews.length > 0) {
      product.numReviews = product.reviews.length;
      product.avgRating =
        product.reviews.reduce((acc, r) => acc + r.rating, 0) /
        product.reviews.length;
    } else {
      product.numReviews = 0;
      product.avgRating = 0;
    }

    await product.save();

    res.json({
      message: "Review deleted",
      reviews: product.reviews,
      avgRating: product.avgRating,
      numReviews: product.numReviews,
    });
  } catch (err) {
    console.error("DELETE REVIEW ERROR:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
