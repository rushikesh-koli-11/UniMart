// backend/routes/adminOrders.js
const router = require("express").Router();
const { protectAdmin } = require("../middleware/auth");
const Order = require("../models/Order");

// ✅ Get all orders (Admin)
router.get("/", protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "title price images");
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update order status (processing/shipped/delivered/cancelled)
router.put("/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Order status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Update payment status (pending/paid/failed)
router.put("/:id/payment", protectAdmin, async (req, res) => {
  try {
    const { paymentStatus } = req.body;
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { paymentStatus },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found" });
    res.json({ message: "Payment status updated", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ Delete order
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
