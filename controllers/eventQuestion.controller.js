const Event = require("../models/Event.model");
const EventRegistrationQuestion = require("../models/EventRegistrationQuestion.model");


/* ================= ADD QUESTION ================= */
exports.addQuestion = async (req, res) => {
  try {

    const { eventId } = req.params;
    const { question, type, options, required } = req.body;

    const event = await Event.findByPk(eventId);

    if (!event || event.hostId !== req.user.id) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const q = await EventRegistrationQuestion.create({
      eventId,
      question,
      type,
      options: options || null,
      required: required || false,
    });

    res.json(q);

  } catch (err) {
    console.error("ADD QUESTION ERROR:", err);

    res.status(500).json({ message: "Add failed" });
  }
};


/* ================= GET QUESTIONS ================= */
exports.getQuestions = async (req, res) => {
  try {

    const { eventId } = req.params;

    const list = await EventRegistrationQuestion.findAll({
      where: { eventId },
      order: [["createdAt", "ASC"]],
    });

    res.json(list);

  } catch (err) {

    console.error("GET QUESTIONS ERROR:", err);

    res.status(500).json({ message: "Load failed" });
  }
};

/* UPDATE */

exports.updateQuestion = async (req, res) => {

  const { id } = req.params;

  await EventRegistrationQuestion.update(
    req.body,
    { where: { id } }
  );

  res.json({ success: true });
};


/* ================= DELETE QUESTION ================= */
exports.deleteQuestion = async (req, res) => {
  try {

    const { id } = req.params;

    await EventRegistrationQuestion.destroy({
      where: { id },
    });

    res.json({ success: true });

  } catch (err) {

    console.error("DELETE QUESTION ERROR:", err);

    res.status(500).json({ message: "Delete failed" });
  }
};
