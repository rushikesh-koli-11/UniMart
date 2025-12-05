const router = require("express").Router();
const Product = require("../models/Product");
const Order = require("../models/Order");
const User = require("../models/User");
const { protectAdmin } = require("../middleware/auth");

// GET ADMIN STATS
router.get("/", protectAdmin, async (req, res) => {
  try {
    const productCount = await Product.countDocuments();
    const orderCount = await Order.countDocuments();
    const userCount = await User.countDocuments();

    // Fetch only paid + delivered orders
    const deliveredOrders = await Order.find({
      paymentStatus: "paid",
      status: "delivered",
    });

    const now = new Date();

    // Today
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    // Last 7 days
    const weekStart = new Date();
    weekStart.setDate(weekStart.getDate() - 7);

    // First day of month
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Function to calculate revenue in a period
    const calculateRevenue = (startDate) =>
      deliveredOrders
        .filter((order) => {
          const date = order.deliveredAt || order.updatedAt || order.createdAt;
          return new Date(date) >= startDate;
        })
        .reduce((sum, order) => sum + Number(order.total || 0), 0);

    const todayRevenue = calculateRevenue(todayStart);
    const weeklyRevenue = calculateRevenue(weekStart);
    const monthlyRevenue = calculateRevenue(monthStart);

    res.json({
      products: productCount,
      orders: orderCount,
      users: userCount,
      todayRevenue,
      weeklyRevenue,
      monthlyRevenue,
    });
  } catch (err) {
    console.error("STATS ERROR:", err);
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
