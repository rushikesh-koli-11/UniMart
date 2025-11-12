const router = require("express").Router();
const Feedback = require("../models/Feedback");
const { protectUser, protectAdmin } = require("../middleware/auth");

// ✅ USER: Submit Feedback
router.post("/", protectUser, async (req, res) => {
  try {
    const { name, email, phone, comment } = req.body;
    if (!comment?.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    const feedback = await Feedback.create({
      user: req.user._id,
      name,
      email,
      phone,
      comment,
    });

    res.json({ message: "Feedback submitted successfully", feedback });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADMIN: Get All Feedback
router.get("/all", protectAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 }); // Newest first
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ✅ ADMIN: Delete Feedback
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
