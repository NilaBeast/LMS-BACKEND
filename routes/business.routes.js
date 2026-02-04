const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  createBusiness,
  getMyBusinesses,
} = require("../controllers/business.controller");

/**
 * CREATE BUSINESS
 * POST /api/business/admin/business
 */
router.post(
  "/admin/business",
  protect,
  upload.single("logo"),
  createBusiness
);

/**
 * ✅ GET ALL MY BUSINESSES
 * GET /api/business/my
 */
router.get("/my", protect, getMyBusinesses);

module.exports = router;
