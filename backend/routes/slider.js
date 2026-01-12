const express = require("express");
const router = express.Router();

const SliderImage = require("../models/SliderImage");
const upload = require("../config/multer");
const cloudinary = require("../config/cloudinary");

router.post("/", upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "slider" },
        (err, result) => {
          if (err) reject(err);
          else resolve(result);
        }
      ).end(req.file.buffer);
    });

    const { link } = req.body;
    const count = await SliderImage.countDocuments();

    const newImg = await SliderImage.create({
      imageUrl: uploadResult.secure_url, 
      order: count + 1,
      link: link || null,
    });

    res.json(newImg);
  } catch (err) {
    console.error("Error uploading image:", err);
    res.status(500).json({ message: "Upload failed" });
  }
});

router.get("/", async (req, res) => {
  try {
    const images = await SliderImage.find().sort({ order: 1 });
    res.json(images);
  } catch (err) {
    console.error("Error fetching images:", err);
    res.status(500).json({ message: "Failed to load images" });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const img = await SliderImage.findByIdAndDelete(req.params.id);
    if (!img) {
      return res.status(404).json({ message: "Image not found" });
    }


    const remaining = await SliderImage.find().sort({ order: 1 });
    for (let i = 0; i < remaining.length; i++) {
      remaining[i].order = i + 1;
      await remaining[i].save();
    }

    res.json({ message: "Image removed and order updated" });
  } catch (err) {
    console.error("Error deleting image:", err);
    res.status(500).json({ message: "Delete failed" });
  }
});

router.put("/reorder", async (req, res) => {
  try {
    const { images } = req.body;
    if (!images || !Array.isArray(images)) {
      return res.status(400).json({ message: "Invalid image data" });
    }

    for (const img of images) {
      await SliderImage.findByIdAndUpdate(img._id, { order: img.order });
    }

    res.json({ message: "Order updated successfully" });
  } catch (err) {
    console.error("Error updating order:", err);
    res.status(500).json({ message: "Failed to update order" });
  }
});

module.exports = router;
