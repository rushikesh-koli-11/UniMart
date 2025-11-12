const router = require("express").Router();
const User = require("../models/User");
const { protectAdmin } = require("../middleware/auth");

// ✅ Get all users (Admin Only)
router.get("/", protectAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ (Optional) Delete user
router.delete("/:id", protectAdmin, async (req, res) => {
  await User.findByIdAndDelete(req.params.id);
  res.json({ message: "User deleted" });
});

module.exports = router;
