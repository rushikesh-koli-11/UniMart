const router = require("express").Router();
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { protectUser } = require("../middleware/auth");
const axios = require("axios");

/* ============================================
   USER REGISTER
============================================= */
router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    const exists = await User.findOne({ email });
    if (exists)
      return res.status(400).json({ message: "Email already registered" });

    await User.create({
      name,
      email,
      phone,
      password,  // ❗ PLAIN PASSWORD (hook will hash)
      addresses: []
    });

    res.json({ message: "Registered successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});



/* ============================================
   USER LOGIN (Using Phone Instead of Email)
============================================= */
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;

    // Validate
    if (!phone || !password) {
      return res.status(400).json({ message: "Phone & password required" });
    }

    // Find user by PHONE (not email)
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(400).json({ message: "Incorrect login details" });
    }

    // Compare passwords
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(400).json({ message: "Incorrect login details" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token, user });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   UPDATE BASIC PROFILE
============================================= */
router.put("/update", protectUser, async (req, res) => {
  try {
    const { name, phone } = req.body;

    req.user.name = name || req.user.name;
    req.user.phone = phone || req.user.phone;

    await req.user.save();

    res.json({ message: "Profile updated", user: req.user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/* ============================================
   MULTIPLE ADDRESSES
============================================= */
router.post("/address/add", protectUser, async (req, res) => {
  const { label, address } = req.body;

  const newAddr = {
    label,
    address,
    isDefault: req.user.addresses.length === 0
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

  if (req.user.addresses.length > 0 &&
    !req.user.addresses.some((a) => a.isDefault)) {
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
      isDefault: req.user.addresses.length === 0
    });
  }

  await req.user.save();
  res.json({ message: "Address saved", user: req.user });
});

/* ============================================
   RESET PASSWORD (After Firebase OTP Verified)
============================================ */
router.post("/reset-password", async (req, res) => {
  try {
    const { phone, newPassword } = req.body;

    if (!phone || !newPassword) {
      return res.status(400).json({ message: "Phone & new password required" });
    }

    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: "User not found for this phone" });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (err) {
    console.error("Reset Password Error:", err);
    res.status(500).json({ message: "Server error occurred" });
  }
});


/* ============================================
   SEND INFO SMS (NOT OTP) USING FAST2SMS
============================================= */
router.post("/send-code-sms", async (req, res) => {
  try {
    const { phone } = req.body;

    const code = "416779"; // FIXED TEST OTP

    const message = `Your UniMart Verification code is ${code}. Please do not share it with anybody.`;

    const options = {
      method: "POST",
      url: "https://www.fast2sms.com/dev/bulkV2",
      headers: { authorization: process.env.FAST2SMS_API_KEY },
      data: {
        route: "q",
        message,
        numbers: phone
      }
    };

    await axios.request(options);

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: "SMS sending error" });
  }
});


module.exports = router;
