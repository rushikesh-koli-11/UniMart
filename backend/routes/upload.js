const router = require("express").Router();
const multer = require("multer");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const { protectAdmin } = require("../middleware/auth");

const storage = multer.memoryStorage();
const upload = multer({ storage });

// ✅ Admin-only image upload
router.post("/image", protectAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Decide folder dynamically
    const folder =
      req.body.type === "category"
        ? "unimark/categories"
        : "unimark/products";

    const uploadStream = cloudinary.uploader.upload_stream(
      { folder },
      (error, result) => {
        if (error) return res.status(500).json({ message: error.message });

        res.json({
          url: result.secure_url,
          public_id: result.public_id
        });
      }
    );

    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
