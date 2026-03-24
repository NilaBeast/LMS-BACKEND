const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { getPlanUsage } = require("../controllers/planBilling.controller");

router.get("/:businessId/usage", protect, getPlanUsage);

module.exports = router;