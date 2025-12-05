const router = require("express").Router();
const Feedback = require("../models/Feedback");
const {protectAdmin } = require("../middleware/auth");

/**
 * PUBLIC + USER FEEDBACK
 * - If logged in → auto attach user ID + user's info
 * - If NOT logged in → allow public submission
 */
router.post("/", async (req, res) => {
  try {
    const { name, email, phone, comment } = req.body;

    if (!comment?.trim()) {
      return res.status(400).json({ message: "Comment is required" });
    }

    let payload = { name, email, phone, comment };

    // If logged in → attach user data
    if (req.user) {
      payload.user = req.user._id;
    }

    await Feedback.create(payload);

    res.json({ message: "Feedback submitted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ADMIN — GET ALL FEEDBACK
 */
router.get("/all", protectAdmin, async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "name email phone")
      .sort({ createdAt: -1 });
    res.json(feedbacks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

/**
 * ADMIN — DELETE FEEDBACK
 */
router.delete("/:id", protectAdmin, async (req, res) => {
  try {
    await Feedback.findByIdAndDelete(req.params.id);
    res.json({ message: "Feedback deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
