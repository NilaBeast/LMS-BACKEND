const jwt = require("jsonwebtoken");
const User = require("../models/User.model");

const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }

    req.user = user; // 🔥 REQUIRED
    next();
  } catch (err) {
    console.error("AUTH ERROR:", err);
    res.status(401).json({ message: "Invalid token" });
  }
};

const protectOptional = async (req, res, next) => {

  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return next(); // allow guest
  }

  try {

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findByPk(decoded.id);

    next();

  } catch (err) {
    next(); // ignore invalid token
  }
};
module.exports = { protect, protectOptional };