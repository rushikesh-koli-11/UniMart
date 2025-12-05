const MostlyUsedLink = require("../models/MostlyUsedLink");
const cloudinary = require("../config/cloudinary");


// Upload helper for Cloudinary
const uploadToCloudinary = (fileBuffer, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      { folder },
      (err, result) => {
        if (err) reject(err);
        else resolve(result);
      }
    ).end(fileBuffer);
  });
};


// ADD new logo
exports.addLink = async (req, res) => {
  try {
    const { link } = req.body;

    if (!req.file) return res.status(400).json({ message: "Logo required" });

    const upload = await uploadToCloudinary(req.file.buffer, "mostlyUsedLinks");

    const count = await MostlyUsedLink.countDocuments();

    const newItem = await MostlyUsedLink.create({
      logo: upload.secure_url,
      link,
      order: count + 1
    });

    res.json({ success: true, data: newItem });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// GET ALL (sorted)
exports.getLinks = async (req, res) => {
  try {
    const data = await MostlyUsedLink.find().sort({ order: 1 });
    res.json({ success: true, data });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// UPDATE link/logo
exports.updateLink = async (req, res) => {
  try {
    let updatedData = {
      link: req.body.link
    };

    // If new logo uploaded
    if (req.file) {
      const upload = await uploadToCloudinary(req.file.buffer, "mostlyUsedLinks");
      updatedData.logo = upload.secure_url;
    }

    const updated = await MostlyUsedLink.findByIdAndUpdate(
      req.params.id,
      updatedData,
      { new: true }
    );

    res.json({ success: true, data: updated });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// DELETE
exports.deleteLink = async (req, res) => {
  try {
    await MostlyUsedLink.findByIdAndDelete(req.params.id);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};


// REORDER ITEMS
exports.updateOrder = async (req, res) => {
  try {
    const { items } = req.body;

    for (const item of items) {
      await MostlyUsedLink.findByIdAndUpdate(item._id, {
        order: item.order
      });
    }

    res.json({ success: true, message: "Order updated successfully" });

  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
