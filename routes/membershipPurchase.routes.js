const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");

const {
  purchaseMembership,
  approvePurchase,
  rejectPurchase,
  getMyActiveMembership,
} = require("../controllers/membershipPurchase.controller");

/* ================= PURCHASE ================= */

router.post("/", protect, purchaseMembership);

router.get("/my-active", protect, getMyActiveMembership);

/* ================= APPROVE ================= */

router.post("/:id/approve", protect, approvePurchase);

/* ================= REJECT ================= */

router.post("/:id/reject", protect, rejectPurchase);

module.exports = router;