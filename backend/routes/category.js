const router = require("express").Router();
const Category = require("../models/Category");
const { protectAdmin } = require("../middleware/auth");

/* ---------------- GET ALL CATEGORIES ---------------- */
router.get("/", async (req, res) => {
  try {
    const categories = await Category.find();
    res.json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- CREATE CATEGORY ---------------- */
router.post("/", protectAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const exists = await Category.findOne({ name });
    if (exists) return res.status(400).json({ message: "Category already exists" });

    const category = await Category.create({
      name,
      description,
      image  // ✅ now image object is saved properly
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- ADD SUBCATEGORY ---------------- */
router.post("/:id/sub", protectAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const cat = await Category.findById(req.params.id);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    cat.subcategories.push({
      name,
      description,
      image   // ✅ store image object
    });

    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPDATE CATEGORY ---------------- */
router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const category = await Category.findById(req.params.id);
    if (!category) return res.status(404).json({ message: "Not found" });

    category.name = name;
    category.description = description;

    if (image) {
      category.image = image; // ✅ Update image if provided
    }

    await category.save();
    res.json(category);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- UPDATE SUBCATEGORY ---------------- */
router.put("/:catId/sub/:subId", protectAdmin, async (req, res) => {
  try {
    const { name, description, image } = req.body;

    const cat = await Category.findById(req.params.catId);
    if (!cat) return res.status(404).json({ message: "Category not found" });

    const sub = cat.subcategories.id(req.params.subId);
    if (!sub) return res.status(404).json({ message: "Subcategory not found" });

    sub.name = name;
    sub.description = description;

    if (image) {
      sub.image = image;  // ✅ Update image if provided
    }

    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- DELETE CATEGORY ---------------- */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ---------------- DELETE SUBCATEGORY ---------------- */
router.delete("/:id/sub/:subId", protectAdmin, async (req, res) => {
  try {
    const cat = await Category.findById(req.params.id);

    cat.subcategories = cat.subcategories.filter(
      sub => sub._id.toString() !== req.params.subId
    );

    await cat.save();
    res.json(cat);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
