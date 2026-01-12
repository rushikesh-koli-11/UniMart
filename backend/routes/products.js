const router = require("express").Router();
const productController = require("../controllers/productController");
const { protectAdmin, protectUser } = require("../middleware/auth");
const Product = require("../models/Product");

router.get("/search", async (req, res) => {
  try {
    const { q, category, subcategory } = req.query;

    const filter = {};

    if (q && q.trim()) {
      filter.title = { $regex: q.trim(), $options: "i" };
    }

    if (category) {
      filter.category = category;
    }

    if (subcategory) {
      filter["subcategory._id"] = subcategory;
    }

    const products = await Product.find(filter).populate("category");

    res.json(products);
  } catch (err) {
    console.error("Search API Error:", err);
    res.status(500).json({ error: err.message });
  }
});

router.get("/", productController.listProducts);      
router.get("/:id", productController.getProduct);

router.post("/:id/reviews", protectUser, productController.addReview);

router.delete(
  "/:id/reviews/:reviewId",
  (req, res, next) => {
    if (req.user?.isAdmin) return next();
    protectUser(req, res, next);
  },
  productController.deleteReview
);

router.post("/", protectAdmin, productController.createProduct);
router.put("/:id", protectAdmin, productController.updateProduct);
router.delete("/:id", protectAdmin, productController.deleteProduct);

router.get("/low-stock/list", async (req, res) => {
  const lowStock = await Product.find({ stock: { $lte: 5 } });
  res.json(lowStock);
});

module.exports = router;
