const express = require("express");
const router = express.Router();
const { protect } = require("../middlewares/auth.middleware");

const { buyPackage } = require("../controllers/packagePurchase.controller");

router.post("/package/:id", protect, buyPackage);

module.exports = router;