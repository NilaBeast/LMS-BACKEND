const EventRoom = require("../models/EventRoom.model");
const EventRoomMessage = require("../models/EventRoomMessage.model");
const Event = require("../models/Event.model");
const User = require("../models/User.model");


/* ================= GET MESSAGES ================= */

exports.getMessages = async (req, res) => {
  try {

    const { eventId } = req.params;


    /* CHECK EVENT EXISTS */
    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    /* FIND / CREATE ROOM */
    let room = await EventRoom.findOne({
      where: { eventId },
    });

    if (!room) {
      room = await EventRoom.create({ eventId });
    }


    /* GET MESSAGES */
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


    /* ALWAYS RETURN ARRAY */
    return res.json(messages || []);


  } catch (err) {

    console.error("GET ROOM MSG ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to load messages",
    });
  }
};


/* ================= SEND MESSAGE ================= */

exports.sendMessage = async (req, res) => {
  try {

    const { eventId } = req.params;
    const { message } = req.body;


    if (!message || !message.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message required",
      });
    }


    /* CHECK EVENT */
    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({
        success: false,
        message: "Event not found",
      });
    }


    /* FIND / CREATE ROOM */
    let room = await EventRoom.findOne({
      where: { eventId },
    });

    if (!room) {
      room = await EventRoom.create({ eventId });
    }


    /* SAVE MESSAGE */
    const msg = await EventRoomMessage.create({

      roomId: room.id,

      userId: req.user.id,

      message: message.trim(),
    });


    /* SEND BACK WITH USER */
    const saved = await EventRoomMessage.findByPk(
      msg.id,
      {
        include: [
          {
            model: User,
            attributes: ["id", "name"],
          },
        ],
      }
    );


    res.status(201).json(saved);


  } catch (err) {

    console.error("SEND ROOM MSG ERROR:", err);

    res.status(500).json({
      success: false,
      message: "Failed to send message",
    });
  }
};
