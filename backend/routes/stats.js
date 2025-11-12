const router = require("express").Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { protectAdmin } = require("../middleware/auth");

// ✅ Admin Only
router.get("/", protectAdmin, async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();

    res.json({
      products: productCount,
      orders: orderCount,
      users: userCount,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
