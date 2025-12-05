const router = require("express").Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const axios = require("axios");

const Admin = require("../models/Admin");
const Order = require("../models/Order");
const { protectAdmin } = require("../middleware/auth");

/* ===========================================================
   VERIFY ADMIN TOKEN MIDDLEWARE
=========================================================== */
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token provided" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin)
      return res.status(403).json({ message: "Access denied. Not admin." });

    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

/* ===========================================================
   SEND FIXED TEST OTP VIA FAST2SMS
=========================================================== */
router.post("/send-code-sms", async (req, res) => {
  try {
    const { phone } = req.body;

    const code = "416779";
    const message = `UniMart Admin verification code: ${code}.`;

    await axios.post(
      "https://www.fast2sms.com/dev/bulkV2",
      {
        route: "q",
        message,
        numbers: phone,
      },
      {
        headers: {
          authorization: process.env.FAST2SMS_API_KEY,
        },
      }
    );

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "Failed to send SMS" });
  }
});

/* ===========================================================
   ADMIN REGISTER
=========================================================== */
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
      return res.status(400).json({ message: "Phone already registered" });

    // password gets hashed by model hook
    await Admin.create({ name, email, phone, password });

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===========================================================
   ADMIN LOGIN (PHONE + PASSWORD)
=========================================================== */
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

    const token = jwt.sign(
      { id: admin._id, isAdmin: true },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, admin });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ===========================================================
   ADMIN RESET PASSWORD (AFTER OTP VERIFIED)
=========================================================== */
router.post("/reset-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword)
      return res.status(400).json({ message: "Phone & password required" });

    const admin = await Admin.findOne({ phone });
    if (!admin)
      return res.status(404).json({ message: "Admin not found" });

    admin.password = newPassword;
    await admin.save();

    res.json({ success: true, message: "Password reset successfully" });
  } catch (err) {
    console.error("Reset Error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* ===========================================================
   GET ALL ORDERS (ADMIN ONLY)
=========================================================== */
router.get("/orders", verifyAdmin, async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email phone")
    .populate("items.product", "title price images");

  res.json(orders);
});

/* ===========================================================
   UPDATE ORDER STATUS
=========================================================== */
router.put("/orders/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;

  let order = await Order.findById(req.params.id);
  if (!order) return res.status(404).json({ message: "Order not found" });

  order.status = status;

  if (status === "delivered" && !order.deliveredAt)
    order.deliveredAt = Date.now();

  await order.save();

  res.json(order);
});

/* ===========================================================
   DELETE ORDER
=========================================================== */
router.delete("/orders/:id", protectAdmin, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});

module.exports = router;
