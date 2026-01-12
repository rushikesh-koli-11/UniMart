const router = require("express").Router();
const { protectAdmin } = require("../middleware/auth");
const Offer = require("../models/Offer");
const Category = require("../models/Category");
const Product = require("../models/Product");

router.get("/", protectAdmin, async (req, res) => {
  try {
    const offers = await Offer.find()
      .populate("category", "name")
      .populate("product", "title");

    res.json(offers);
  } catch (err) {
    console.error("Failed to fetch offers:", err.message);
    res.status(500).json({ message: "Failed to fetch offers" });
  }
});

router.post("/", protectAdmin, async (req, res) => {
  try {
    const {
      title,
      description,
      scopeType,
      category,
      subcategoryId,
      product,
      discountType,
      discountValue,
      minCartAmount,
      minMrp,
      couponCode,
      autoApply,
      active,
      startDate,
      endDate,
    } = req.body;

    if (scopeType === "category" && !category) {
      return res.status(400).json({ message: "Category is required" });
    }

    if (scopeType === "subcategory" && !subcategoryId) {
      return res.status(400).json({ message: "Subcategory ID is required" });
    }

    if (scopeType === "product" && !product) {
      return res.status(400).json({ message: "Product is required" });
    }

    const offer = await Offer.create({
      title,
      description,
      scopeType,
      category: category || null,
      subcategoryId: subcategoryId || null,
      product: product || null,
      discountType,
      discountValue,
      minCartAmount,
      minMrp,
      couponCode,
      autoApply,
      active,
      startDate,
      endDate,
    });

    res.json({ message: "Offer created", offer });
  } catch (err) {
    console.error("Offer create error:", err.message);
    res.status(500).json({ message: "Failed to create offer" });
  }
});

router.put("/:id", protectAdmin, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer updated", offer });
  } catch (err) {
    console.error("Offer update error:", err.message);
    res.status(500).json({ message: "Failed to update offer" });
  }
});

router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    const offer = await Offer.findByIdAndDelete(req.params.id);

    if (!offer) return res.status(404).json({ message: "Offer not found" });

    res.json({ message: "Offer deleted" });
  } catch (err) {
    console.error("Offer deletion error:", err.message);
    res.status(500).json({ message: "Failed to delete offer" });
  }
});

module.exports = router;
