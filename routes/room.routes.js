const express = require("express");
const router = express.Router();

const {protect} = require("../middlewares/auth.middleware");
const {canAccessRoom} = require("../middlewares/roomAccess.middleware");

const {getRoomMessages, sendRoomMessage} = require("../controllers/room.controller");

router.get("/:courseId/messages", protect, canAccessRoom, getRoomMessages);
router.post("/:courseId/messages", protect, canAccessRoom, sendRoomMessage);

module.exports = router;