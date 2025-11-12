// backend/controllers/adminAuthController.js (Admin)
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Admin = require('../models/Admin');

const signToken = (id) =>
  jwt.sign({ id, isAdmin: true }, process.env.JWT_SECRET, { expiresIn: '7d' });

exports.register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const exists = await Admin.findOne({ email });
    if (exists) return res.status(400).json({ message: 'Email already used' });
    const admin = await Admin.create({ name, email, password, phone });
    res.json({ token: signToken(admin._id), admin: { id: admin._id, name: admin.name, email: admin.email }});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ message: 'Invalid credentials' });
    const ok = await bcrypt.compare(password, admin.password);
    if (!ok) return res.status(400).json({ message: 'Invalid credentials' });

    res.json({ token: signToken(admin._id), admin: { id: admin._id, name: admin.name, email: admin.email }});
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
