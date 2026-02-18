const EventRoom = require("../models/EventRoom.model");
const EventRoomMessage = require("../models/EventRoomMessage.model");
const Event = require("../models/Event.model");
const EventRegistration = require("../models/EventRegistration.model");
const User = require("../models/User.model");


/* =====================================================
   ACCESS CHECK HELPER
===================================================== */

async function checkRoomAccess(eventId, userId) {

  const event = await Event.findByPk(eventId);

  if (!event) {
    return { error: 404 };
  }

  /* ✅ HOST ALWAYS ALLOWED */
  if (event.hostId === userId) {
    return { allowed: true };
  }

  /* ✅ STUDENT MUST BE APPROVED */
  const registration = await EventRegistration.findOne({
    where: {
      eventId,
      userId,
      status: "approved",   // 🚨 IMPORTANT
    },
  });

  if (!registration) {
    return { error: 403 };
  }

  return { allowed: true };
}



/* =====================================================
   GET MESSAGES
===================================================== */

exports.getMessages = async (req, res) => {

  try {

    const { eventId } = req.params;
    const userId = req.user.id;

    const access = await checkRoomAccess(eventId, userId);

    if (access.error === 404) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (access.error === 403) {
      return res.status(403).json({
        message: "Register and get approval to access this room",
      });
    }


    /* FIND OR CREATE ROOM */
    let room = await EventRoom.findOne({
      where: { eventId },
    });

    if (!room) {
      room = await EventRoom.create({ eventId });
    }


    const messages = await EventRoomMessage.findAll({

      where: { roomId: room.id },

      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],

      order: [["createdAt", "ASC"]],
    });

    res.json(messages || []);

  } catch (err) {

    console.error("ROOM LOAD ERROR:", err);

    res.status(500).json({
      message: "Failed to load messages",
    });
  }
};



/* =====================================================
   SEND MESSAGE
===================================================== */

exports.sendMessage = async (req, res) => {

  try {

    const { eventId } = req.params;
    const { message } = req.body;
    const userId = req.user.id;

    if (!message || !message.trim()) {
      return res.status(400).json({
        message: "Message required",
      });
    }


    const access = await checkRoomAccess(eventId, userId);

    if (access.error === 404) {
      return res.status(404).json({
        message: "Event not found",
      });
    }

    if (access.error === 403) {
      return res.status(403).json({
        message: "Not allowed to send message",
      });
    }


    /* FIND OR CREATE ROOM */
    let room = await EventRoom.findOne({
      where: { eventId },
    });

    if (!room) {
      room = await EventRoom.create({ eventId });
    }


    const msg = await EventRoomMessage.create({
      roomId: room.id,
      userId,
      message: message.trim(),
    });


    const saved = await EventRoomMessage.findByPk(msg.id, {
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
    });


    res.status(201).json(saved);

  } catch (err) {

    console.error("ROOM SEND ERROR:", err);

    res.status(500).json({
      message: "Failed to send message",
    });
  }
};
