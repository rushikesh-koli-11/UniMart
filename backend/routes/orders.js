// backend/routes/orders.js
const router = require("express").Router();
const { protectUser } = require("../middleware/auth");
const Order = require("../models/Order");

// ✅ Create new order
router.post("/", protectUser, async (req, res) => {
  try {
    const { items, total, paymentDetails, shippingInfo } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items in order" });

    if (!shippingInfo?.address)
      return res.status(400).json({ message: "Shipping address required" });

    const order = await Order.create({
      user: req.user._id,
      items,
      total,
      paymentStatus: paymentDetails?.status || "pending",
      shippingInfo,
    });

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    console.error("Order creation failed:", err.message);
    res.status(500).json({ message: "Failed to place order" });
  }
});

// ✅ User: Get My Orders
// backend/routes/orders.js
router.get("/my", protectUser, async (req, res) => {
  try {
    let orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title price images");

    // ✅ filter out null products (deleted products)
    orders = orders.map(o => ({
      ...o.toObject(),
      items: o.items.filter(i => i.product !== null)
    }));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});


// ✅ User: Cancel Order
router.put("/:id/cancel", protectUser, async (req, res) => {
  const order = await Order.findOne({ _id: req.params.id, user: req.user._id });
  if (!order) return res.status(404).json({ message: "Order not found" });

  if (order.status !== "processing")
    return res.status(400).json({ message: "Cannot cancel now" });

  order.status = "cancelled";
  await order.save();
  res.json({ message: "Order cancelled", order });
});

module.exports = router;
