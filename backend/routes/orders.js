const router = require("express").Router();
const { protectUser, protectAdmin } = require("../middleware/auth");
const Order = require("../models/Order");
const Product = require("../models/Product");

/* =====================================================
   CREATE NEW ORDER  (Auto Reduce Stock)
===================================================== */
router.post("/", protectUser, async (req, res) => {
  try {
    const { items, total, paymentDetails, shippingInfo } = req.body;

    if (!items || items.length === 0)
      return res.status(400).json({ message: "No items in order" });

    if (!shippingInfo?.address)
      return res.status(400).json({ message: "Shipping address required" });

    // Check stock before creating order
    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product)
        return res.status(404).json({ message: "Product not found" });

      if (product.stock < item.quantity) {
        return res.status(400).json({
          message: `${product.title} has only ${product.stock} stock`,
        });
      }
    }

    // Create order
    const order = await Order.create({
      user: req.user._id,
      items,
      total,
      paymentStatus: paymentDetails?.status || "pending",
      shippingInfo,
    });

    // Reduce stock
    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: -item.quantity } },
        { new: true }
      );
    }

    res.json({ message: "Order placed successfully", order });

  } catch (err) {
    console.error("Order creation failed:", err.message);
    res.status(500).json({ message: "Failed to place order" });
  }
});

/* =====================================================
   GET USER ORDERS
===================================================== */
router.get("/my", protectUser, async (req, res) => {
  try {
    let orders = await Order.find({ user: req.user._id })
      .populate("items.product", "title price images");

    orders = orders.map((o) => ({
      ...o.toObject(),
      items: o.items.filter((i) => i.product !== null),
    }));

    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   CANCEL ORDER (Auto Restore Stock)
===================================================== */
router.put("/:id/cancel", protectUser, async (req, res) => {
  try {
    const order = await Order.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!order)
      return res.status(404).json({ message: "Order not found" });

    if (order.status !== "processing")
      return res.status(400).json({ message: "Cannot cancel now" });

    // Restore stock
    for (const item of order.items) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { new: true }
      );
    }

    order.status = "cancelled";
    await order.save();

    res.json({ message: "Order cancelled & stock restored", order });

  } catch (err) {
    console.error("Cancel error:", err.message);
    res.status(500).json({ message: "Failed to cancel order" });
  }
});

/* =====================================================
   ADMIN: GET ALL ORDERS
===================================================== */
router.get("/", protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email")
      .populate("items.product", "title images price");

    res.json(orders);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* =====================================================
   ADMIN: UPDATE ORDER STATUS
   (processing → packed → shipped → delivered)
===================================================== */
router.put("/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    const order = await Order.findById(req.params.id);
    if (!order)
      return res.status(404).json({ message: "Order not found" });

    order.status = status;

    // Auto-set delivery time
    if (status === "delivered") {
      order.deliveredAt = new Date();
    }

    await order.save();

    res.json({ message: "Order updated", order });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
