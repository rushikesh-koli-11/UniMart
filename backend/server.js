require("dotenv").config();
const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const { auth } = require("./middleware/auth"); // ⭐ ADD THIS

const app = express();
connectDB();

app.use(cors({ origin: process.env.CLIENT_URL || "*" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.use(auth);  // ⭐ VERY IMPORTANT – decode token globally

app.use("/api/auth", require("./routes/auth"));
app.use("/api/admin", require("./routes/admin"));
app.use("/api/products", require("./routes/products"));
app.use("/api/orders", require("./routes/orders"));
app.use("/api/upload", require("./routes/upload"));
app.use("/api/payment", require("./routes/payment"));
app.use("/api/feedback", require("./routes/feedback"));
app.use("/api/categories", require("./routes/category"));
app.use("/api/stats", require("./routes/stats"));
app.use("/api/user", require("./routes/userAuth"));
app.use("/api/adminAuth", require("./routes/adminAuth"));
app.use("/api/users", require("./routes/users"));
app.use("/api/admin/orders", require("./routes/adminOrders"));
app.use("/api/slider", require("./routes/slider"));
app.use("/api/mostly-used", require("./routes/mostlyUsed"));
app.use("/api/offers", require("./routes/publicOffers"));
app.use("/api/admin/offers", require("./routes/adminOffers"));

app.get("/api/health", (_, res) => res.json({ ok: true }));

process.on("uncaughtException", (err) => {
  console.error("🔥 UNCAUGHT ERROR:", err.message);
  console.error(err.stack);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.error("🔥 UNHANDLED PROMISE:", err.message);
  console.error(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
