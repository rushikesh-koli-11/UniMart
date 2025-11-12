// backend/routes/payment.js
const router = require('express').Router();
const Razorpay = require('razorpay');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

router.post('/razorpay/create-order', async (req, res) => {
  try {
    const { amount, currency = 'INR' } = req.body;
    const options = { amount: Math.round(amount * 100), currency, payment_capture: 1 };
    const order = await razorpay.orders.create(options);
    res.json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/stripe/create-payment-intent', async (req, res) => {
  try {
    const { amount, currency = 'inr' } = req.body;
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
