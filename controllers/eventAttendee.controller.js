const Event = require("../models/Event.model");
const User = require("../models/User.model");
const EventRegistration = require("../models/EventRegistration.model");
const EventRegistrationAnswer = require("../models/EventRegistrationAnswer.model");
const EventRegistrationQuestion = require("../models/EventRegistrationQuestion.model");


exports.getEventAttendees = async (req, res) => {
  try {

    const { eventId } = req.params;

    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }

    /* Hide logic */
    if (event.hideAttendeeList && event.hostId !== req.user.id) {
      return res.status(403).json({
        message: "Attendee list hidden",
      });
    }

    const list = await EventRegistration.findAll({
      where: { eventId },

      include: [
        {
          model: User,
          attributes: ["id", "email", "name"],
        },
        {
          model: EventRegistrationAnswer,
          include: [EventRegistrationQuestion],
        },
      ],
    });

    res.json(list);

  } catch (err) {

    console.error("GET ATTENDEES ERROR:", err);

    res.status(500).json({ message: "Load failed" });
  }
};
