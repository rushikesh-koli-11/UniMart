const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const signToken = (id) =>
  jwt.sign({ id, isAdmin: false }, process.env.JWT_SECRET, { expiresIn: "7d" });

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: "Email already registered" });

    const user = await User.create({ name, email, password, phone });
    res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email }});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    res.json({ token: signToken(user._id), user: { id: user._id, name: user.name, email: user.email }});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
