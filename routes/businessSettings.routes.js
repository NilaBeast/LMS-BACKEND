const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");

const {
  getEmailPreferences,
  updateEmailPreferences
} = require("../controllers/businessSettings.controller");

/**
 * GET EMAIL PREF
 */
router.get("/:businessId/email-preferences", protect, getEmailPreferences);

/**
 * UPDATE EMAIL PREF
 */
router.put("/:businessId/email-preferences", protect, updateEmailPreferences);

module.exports = router;