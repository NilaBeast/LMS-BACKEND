const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  createBusiness,
  getMyBusinesses,
  updateBusiness
} = require("../controllers/business.controller");

/**
 * CREATE BUSINESS
 * POST /api/business/admin/business
 */
router.post(
  "/admin/business",
  protect,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]),
  createBusiness
);

/**
 * UPDATE BUSINESS (logo + banner + links + description + slug)
 * PUT /api/business/:id
 */
router.put(
  "/:id",
  protect,
  upload.fields([
    { name: "logo", maxCount: 1 },
    { name: "banner", maxCount: 1 }
  ]),
  updateBusiness
);

/**
 * GET ALL MY BUSINESSES
 * GET /api/business/my
 */
router.get("/my", protect, getMyBusinesses);

module.exports = router;