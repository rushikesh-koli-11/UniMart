// backend/controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.createOrder = async (req, res) => {
  try {
    if (!req.user || req.user.isAdmin) {
      return res.status(401).json({ message: "User auth required" });
    }

    const { items, total, paymentDetails, shippingInfo } = req.body;

    const order = await Order.create({
      user: req.user._id,          // ✅ RIGHT USER SAVED HERE
      items,
      total,
      paymentStatus: paymentDetails?.status || "pending",
      shippingInfo
    });

    res.json({ message: "Order placed successfully", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getUserOrders = async (req, res) => {
  const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json(orders);
};


exports.getAllOrders = async (req, res) => {
  const orders = await Order.find().populate('user').populate('items.product');
  res.json(orders);
};

exports.updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
