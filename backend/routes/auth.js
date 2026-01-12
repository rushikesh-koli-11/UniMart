const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protectUser } = require("../middleware/auth");
const OTP = require("../models/OTP"); // 🔥 NEW: to check OTP status

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "7d" });

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, phone & password are required" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const phoneExists = await User.findOne({ phone });
    if (phoneExists) {
      return res
        .status(400)
        .json({ message: "Phone already registered. Please login." });
    }

    const pendingOtp = await OTP.findOne({ phoneNumber: phone });
    if (pendingOtp) {
      return res
        .status(400)
        .json({ message: "Please verify OTP before registration" });
    }

    const user = await User.create({
      name,
      email,
      phone,
      password,
      addresses: [],
    });

    const token = generateToken(user._id);

    res.json({
      message: "Registered successfully",
      token,
      user,
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    if (!phone || !password) {
      return res.status(400).json({ message: "Phone & password required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Incorrect login details" });
    }

    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect login details" });
    }

    const token = generateToken(user._id);

    res.json({ token, user });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.put("/update", protectUser, async (req, res) => {
  try {
    const { name, phone } = req.body;

    req.user.name = name || req.user.name;
    req.user.phone = phone || req.user.phone;

    await req.user.save();

    res.json({ message: "Profile updated", user: req.user });
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: err.message });
  }
});

router.post("/address/add", protectUser, async (req, res) => {
  const { label, address } = req.body;

  const newAddr = {
    label,
    address,
    isDefault: req.user.addresses.length === 0,
  };

  req.user.addresses.push(newAddr);
  await req.user.save();

  res.json({ message: "Address added", user: req.user });
});

router.put("/address/update/:id", protectUser, async (req, res) => {
  const { label, address } = req.body;
  const addr = req.user.addresses.id(req.params.id);

  if (!addr) return res.status(404).json({ message: "Address not found" });

  addr.label = label || addr.label;
  addr.address = address || addr.address;

  await req.user.save();
  res.json({ message: "Address updated", user: req.user });
});

router.delete("/address/remove/:id", protectUser, async (req, res) => {
  const id = req.params.id;

  const exists = req.user.addresses.find((a) => a._id.toString() === id);
  if (!exists) return res.status(404).json({ message: "Address not found" });

  req.user.addresses = req.user.addresses.filter(
    (a) => a._id.toString() !== id
  );

  if (
    req.user.addresses.length > 0 &&
    !req.user.addresses.some((a) => a.isDefault)
  ) {
    req.user.addresses[0].isDefault = true;
  }

  await req.user.save();

  res.json({ message: "Address removed", user: req.user });
});

router.put("/address/default/:id", protectUser, async (req, res) => {
  const id = req.params.id;

  req.user.addresses.forEach((a) => (a.isDefault = false));

  const addr = req.user.addresses.find((a) => a._id.toString() === id);
  if (!addr) return res.status(404).json({ message: "Address not found" });

  addr.isDefault = true;

  await req.user.save();

  res.json({ message: "Default address set", user: req.user });
});

router.post("/address/save-from-checkout", protectUser, async (req, res) => {
  const { label = "Other", address } = req.body;

  if (!address || address.trim() === "") {
    return res.status(400).json({ message: "Address cannot be empty" });
  }

  const exists = req.user.addresses.find(
    (a) => a.address.toLowerCase() === address.toLowerCase()
  );

  if (!exists) {
    req.user.addresses.push({
      label,
      address,
      isDefault: req.user.addresses.length === 0,
    });
  }

  await req.user.save();
  res.json({ message: "Address saved", user: req.user });
});

router.post("/reset-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res
        .status(400)
        .json({ message: "Phone & new password required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res
        .status(404)
        .json({ message: "User not found for this phone" });
    }

    const pendingOtp = await OTP.findOne({ phoneNumber: phone });
    if (pendingOtp) {
      return res
        .status(400)
        .json({ message: "Please verify OTP before resetting password" });
    }

    user.password = newPassword; 

    res.json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error occurred" });
  }
});

module.exports = router;
