// backend/controllers/feedbackController.js
const Feedback = require('../models/Feedback');

exports.create = async (req, res) => {
  try {
    const fb = await Feedback.create({ user: req.user._id, message: req.body.message });
    res.json(fb);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

exports.listAll = async (_req, res) => {
  const list = await Feedback.find().populate('user', 'name email');
  res.json(list);
};
