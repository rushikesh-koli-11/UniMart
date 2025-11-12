// backend/server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

const { auth } = require("./middleware/auth");
app.use(auth);


app.use(cors({ origin: process.env.CLIENT_URL || '*' }));
app.use(express.json());

// Routes
app.use('/api/auth',     require('./routes/auth'));     // user
app.use('/api/admin',    require('./routes/admin'));    // admin
app.use('/api/products', require('./routes/products'));
app.use('/api/orders',   require('./routes/orders'));
app.use('/api/upload',   require('./routes/upload'));
app.use('/api/payment',  require('./routes/payment'));
app.use("/api/feedback", require("./routes/feedback"));
app.use('/api/categories', require('./routes/category'));
app.use('/api/stats', require('./routes/stats'));
app.use("/api/user", require("./routes/userAuth"));
app.use("/api/admin", require("./routes/adminAuth"));
app.use('/api/users', require('./routes/users'));
app.use('/api/admin/orders', require('./routes/adminOrders'));


// Basic health
app.get('/api/health', (_,res)=>res.json({ ok:true }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
