const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");

const {
  getPixelSettings,
  updatePixelSettings
} = require("../controllers/pixelSettings.controller");

/**
 * GET PIXEL SETTINGS
 */
router.get("/:businessId/pixel", protect, getPixelSettings);

/**
 * UPDATE PIXEL SETTINGS
 */
router.put("/:businessId/pixel", protect, updatePixelSettings);

module.exports = router;