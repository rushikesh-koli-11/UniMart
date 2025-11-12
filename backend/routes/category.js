const router = require("express").Router();
const Category = require("../models/Category");
const { protectAdmin } = require("../middleware/auth");

// ✅ Get all categories
router.get("/", async (req, res) => {
  const categories = await Category.find();
  res.json(categories);
});

// ✅ Add category
router.post("/", protectAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({ name, description });
    res.json(category);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ✅ Add Subcategory to a category
router.post("/:id/sub", protectAdmin, async (req, res) => {
  const { name, description } = req.body;
  try {
    const cat = await Category.findById(req.params.id);
    cat.subcategories.push({ name, description });
    await cat.save();
    res.json(cat);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

// ✅ Delete Subcategory
router.delete("/:id/sub/:subId", protectAdmin, async (req, res) => {
  const cat = await Category.findById(req.params.id);
  cat.subcategories = cat.subcategories.filter(sub => String(sub._id) !== req.params.subId);
  await cat.save();
  res.json(cat);
});


// ✅ DELETE CATEGORY (handles both main + sub)
router.delete("/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Category not found" });

    // Delete subcategories first
    await Category.deleteMany({ parent: category._id });

    // Then delete main category
    await Category.findByIdAndDelete(category._id);

    res.json({ message: "Category and its subcategories deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


module.exports = router;
