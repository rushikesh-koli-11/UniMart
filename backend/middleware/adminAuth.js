const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

module.exports = async function (req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ message: "Admin token required" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = await Admin.findById(decoded.id).select("-password");
    if (!admin || !admin.isAdmin) return res.status(403).json({ message: "Not an admin" });
    req.admin = admin;
    next();
  } catch {
    return res.status(403).json({ message: "Invalid token" });
  }
};
