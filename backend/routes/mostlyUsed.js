const express = require("express");
const router = express.Router();
const upload = require("../config/multer");

const {
  addLink,
  getLinks,
  deleteLink,
  updateLink,
  updateOrder
} = require("../controllers/mostlyUsedController");

// Admin Protected (optional)
// const adminAuth = require("../middleware/adminAuth");

router.post("/add", upload.single("logo"), addLink);
router.get("/all", getLinks);
router.put("/update/:id", upload.single("logo"), updateLink);
router.delete("/:id", deleteLink);
router.put("/reorder", updateOrder);

module.exports = router;
