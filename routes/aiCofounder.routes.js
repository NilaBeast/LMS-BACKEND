const router = require("express").Router();

const { protect } = require("../middlewares/auth.middleware");

const {
 aiCofounderChat,
 getAIHistory,
 generateLandingPage
} = require("../controllers/aiCofounder.controller");

router.post("/chat", protect, aiCofounderChat);
router.get("/history", protect, getAIHistory);

router.post("/landing-page", protect, generateLandingPage);

module.exports = router;