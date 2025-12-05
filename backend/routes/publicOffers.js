// backend/routes/publicOffers.js
const router = require("express").Router();
const Offer = require("../models/Offer");

router.get("/active", async (req, res) => {
  const today = new Date();

  const offers = await Offer.find({
    active: true,
    $or: [
      { endDate: null },
      { endDate: { $gte: today } }
    ]
  });

  res.json(offers);
});

module.exports = router;
