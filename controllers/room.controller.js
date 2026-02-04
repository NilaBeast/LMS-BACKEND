const CourseRoom = require("../models/CourseRoom.model");
const RoomMessage = require("../models/RoomMessage.model");
const User = require("../models/User.model");

/**
 * GET ROOM MESSAGES
 * GET /api/rooms/:courseId/messages
 */
exports.getRoomMessages = async (req, res) => {
  try {
    const { courseId } = req.params;

    const room = await CourseRoom.findOne({
      where: { courseId },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const messages = await RoomMessage.findAll({
      where: { roomId: room.id },
      include: [
        {
          model: User,
          attributes: ["id", "name", "photo"],
        },
      ],
      order: [["createdAt", "ASC"]],
    });

    res.json(messages);
  } catch (err) {
    console.error("GET ROOM MESSAGES ERROR:", err);
    res.status(500).json({ message: "Failed to load messages" });
  }
};

/**
 * SEND MESSAGE
 * POST /api/rooms/:courseId/messages
 */
exports.sendRoomMessage = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { message } = req.body;

    if (!message || !message.trim()) {
      return res.status(400).json({ message: "Message required" });
    }

    const room = await CourseRoom.findOne({
      where: { courseId },
    });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const msg = await RoomMessage.create({
      roomId: room.id,
      userId: req.user.id,
      message,
    });

    res.status(201).json(msg);
  } catch (err) {
    console.error("SEND MESSAGE ERROR:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};
