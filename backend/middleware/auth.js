const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Admin = require("../models/Admin");

exports.auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) return next();

    const token = header.split(" ")[1];
    if (!token) return next();

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // ✅ Check Admin first
    if (decoded.isAdmin === true) {
      const admin = await Admin.findById(decoded.id).select("-password");
      if (admin) {
        req.user = admin;
        req.user.isAdmin = true;
        return next();
      }
      return next(); // token said admin, but admin no longer in DB
    }

    // ✅ Otherwise treat as USER
    const user = await User.findById(decoded.id).select("-password");
    if (user) {
      req.user = user;
      req.user.isAdmin = false;
      return next();
    }

    next();
  } catch (err) {
    console.log("JWT ERROR:", err.message);
    next();
  }
};

// ✅ Protect normal user routes
exports.protectUser = (req, res, next) => {
  if (!req.user || req.user.isAdmin === true)
    return res.status(401).json({ message: "User auth required" });
  next();
};

// ✅ Protect admin routes
exports.protectAdmin = (req, res, next) => {
  if (!req.user || req.user.isAdmin !== true)
    return res.status(403).json({ message: "Admin auth required" });
  next();
};
