const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { joinBySlug } = require("../controllers/invite.controller");

router.post("/join/slug/:slug", protect, joinBySlug);

module.exports = router;