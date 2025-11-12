const router = require("express").Router();
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");
const Order = require("../models/Order");
const bcrypt = require("bcryptjs");
const { protectAdmin } = require("../middleware/auth");


// ✅ MIDDLEWARE - Verify Admin Token
function verifyAdmin(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "No token" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (!decoded.isAdmin) return res.status(403).json({ message: "Not admin" });
    req.admin = decoded;
    next();
  } catch {
    return res.status(401).json({ message: "Invalid token" });
  }
}

// ✅ ADMIN REGISTER
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: "Admin already exists" });

    const hashed = await bcrypt.hash(password, 10);

    const admin = await Admin.create({ name, email, phone, password: hashed });

    res.json({ message: "Admin registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADMIN LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: "Incorrect email or password" });

    const match = await bcrypt.compare(password, admin.password);
    if (!match) return res.status(400).json({ message: "Incorrect email or password" });

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

// ✅ GET ALL ORDERS (Admin Only)
router.get("/orders", verifyAdmin, async (req, res) => {
  const orders = await Order.find()
    .populate("user", "name email")
    .populate("items.product", "title price images");
  res.json(orders);
});

// ✅ UPDATE ORDER STATUS (Admin Only)
router.put("/orders/:id/status", verifyAdmin, async (req, res) => {
  const { status } = req.body;
  const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
  res.json(order);
});

// backend/routes/admin.js
router.delete("/orders/:id", protectAdmin, async (req, res) => {
  await Order.findByIdAndDelete(req.params.id);
  res.json({ message: "Order deleted" });
});


module.exports = router;
