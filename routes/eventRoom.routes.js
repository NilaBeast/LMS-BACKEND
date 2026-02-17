const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { canAccessEventRoom } = require("../middlewares/eventRoomAccess.middleware");

const {
  getMessages,
  sendMessage,
} = require("../controllers/eventRoom.controller");

router.get("/:eventId/messages", protect, canAccessEventRoom, getMessages);
router.post("/:eventId/messages", protect, canAccessEventRoom, sendMessage);

module.exports = router;
