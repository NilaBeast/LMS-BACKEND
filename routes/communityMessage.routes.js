const router = require("express").Router();

const controller = require("../controllers/communityMessage.controller");

const { protect } = require("../middlewares/auth.middleware");

/* ================= MESSAGES ================= */

/* SEND MESSAGE */
router.post("/:communityId", protect, controller.sendMessage);

/* GET ALL MESSAGES */
router.get("/:communityId", protect, controller.getMessages);

module.exports = router;