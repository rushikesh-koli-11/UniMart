const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const Admin = require("../models/Admin");
const Order = require("../models/Order");
const OTP = require("../models/OTP");         // ⭐ Required for OTP verification
const { protectAdmin } = require("../middleware/auth");

const generateAdminToken = (admin) =>
  jwt.sign(
    { id: admin._id, isAdmin: true },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password)
      return res.status(400).json({ message: "All fields are required" });

    if (!email.endsWith("@gmail.com"))
      return res.status(400).json({ message: "Email must end with @gmail.com" });

    if (!/^\d{10}$/.test(phone))
      return res.status(400).json({ message: "Phone must be 10 digits" });

    const existsEmail = await Admin.findOne({ email });
    if (existsEmail)
      return res.status(400).json({ message: "Email already registered" });

    const existsPhone = await Admin.findOne({ phone });
    if (existsPhone)
      return res.status(400).json({ message: "Phone number already registered" });

    const pendingOtp = await OTP.findOne({ phoneNumber: phone });
    if (pendingOtp) {
      return res.status(400).json({
        message: "Please verify OTP before registering admin",
      });
    }

    
    const admin = await Admin.create({
      name,
      email,
      phone,
      password, 
    });

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error("Admin Register Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password)
      return res.status(400).json({ message: "Phone & password required" });

    const admin = await Admin.findOne({ phone });
    if (!admin)
      return res.status(400).json({ message: "Incorrect number or password" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match)
      return res.status(400).json({ message: "Incorrect number or password" });

    const token = generateAdminToken(admin);

    res.json({ token, admin });
  } catch (err) {
    console.error("Admin Login Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword)
      return res.status(400).json({ message: "Phone & new password required" });

    const admin = await Admin.findOne({ phone });
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    const pendingOtp = await OTP.findOne({ phoneNumber: phone });
    if (pendingOtp) {
      return res.status(400).json({
        message: "Please verify OTP before resetting password",
      });
    }

    admin.password = newPassword; 
    await admin.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Admin Reset Password Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/orders", protectAdmin, async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("user", "name email phone")
      .populate("items.product", "title price images");

    res.json(orders);
  } catch (err) {
    console.error("Fetch Orders Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/orders/:id/status", protectAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    let order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ message: "Order not found" });

    order.status = status;
    if (status === "delivered" && !order.deliveredAt)
      order.deliveredAt = Date.now();

    await order.save();

    res.json(order);
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.delete("/orders/:id", protectAdmin, async (req, res) => {
  try {
    await Order.findByIdAndDelete(req.params.id);
    res.json({ message: "Order deleted" });
  } catch (err) {
    console.error("Delete Order Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/me", protectAdmin, async (req, res) => {
  const admin = await Admin.findById(req.admin.id).select("-password");
  res.json({ admin });
});


module.exports = router;
