const express = require("express");

const router = express.Router();

const Course = require("../models/Course.model");
const Product = require("../models/Product.model");
const Event = require("../models/Event.model");

const Quiz = require("../models/Quiz.model");
const QuizQuestion = require("../models/QuizQuestion.model");

const Session = require("../models/Session.model");
const SessionBooking = require("../models/SessionBooking.model");
const User = require("../models/User.model");


/* ================= COURSES ================= */

router.get("/courses", async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: Product,
          where: { status: "published" },
          attributes: ["status"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(courses);

  } catch (err) {
    console.error("PUBLIC COURSES ERROR:", err);
    res.status(500).json({ message: "Load failed" });
  }
});


router.get("/courses/:id", async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id },

      include: [
        {
          model: Product,
          where: { status: "published" },
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not found" });
    }

    res.json(course);

  } catch (err) {
    console.error("PUBLIC COURSE ERROR:", err);
    res.status(500).json({ message: "Load failed" });
  }
});


router.get("/courses/:id/landing", async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id },
      include: [Product],
    });

    if (!course || course.Product.status !== "published") {
      return res
        .status(404)
        .json({ message: "Not found" });
    }

    res.json({
      id: course.id,
      name: course.name,
      description: course.description,
      cover: course.coverImage,
      pricing: course.pricing,
    });

  } catch (err) {
    console.error("COURSE LANDING ERROR:", err);
    res.status(500).json({ message: "Load failed" });
  }
});


/* ================= EVENTS ================= */

router.get("/events", async (req, res) => {
  try {
    const events = await Event.findAll({
      include: [
        {
          model: Product,
          where: { status: "published" },
        },
      ],
      order: [["startAt", "ASC"]],
    });

    res.json(events);

  } catch (err) {
    console.error("PUBLIC EVENTS ERROR:", err);
    res.status(500).json({ message: "Load failed" });
  }
});


router.get("/events/:id", async (req, res) => {
  try {
    const event = await Event.findOne({
      where: { id: req.params.id },

      include: [
        {
          model: Product,
          where: { status: "published" },
        },
      ],
    });

    if (!event) {
      return res
        .status(404)
        .json({ message: "Event not found" });
    }

    res.json(event);

  } catch (err) {
    console.error("PUBLIC EVENT ERROR:", err);
    res.status(500).json({ message: "Load failed" });
  }
});


/* ================= PUBLIC QUIZ ================= */
/* ✅ NEW */

router.get("/quiz/:chapterId", async (req, res) => {
  try {
    const { chapterId } = req.params;

    const quiz = await Quiz.findOne({
      where: { chapterId },

      include: [
        {
          model: QuizQuestion,
          order: [["order", "ASC"]],
        },
      ],
    });

    if (!quiz) {
      return res
        .status(404)
        .json({ message: "Quiz not found" });
    }

    res.json(quiz);

  } catch (err) {
    console.error("PUBLIC QUIZ ERROR:", err);

    res.status(500).json({
      message: "Failed to load quiz",
    });
  }
});

/* ================= SESSIONS ================= */

/* Get all published sessions */

router.get("/sessions", async (req, res) => {
  try {

    const sessions = await Session.findAll({
      include: [
        {
          model: Product,
          where: {
            status: "published",
            type: "session",
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(sessions);

  } catch (err) {

    console.error("PUBLIC SESSIONS ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });
  }
});


/* Get single session */

router.get("/sessions/:id", async (req, res) => {
  try {

    const session = await Session.findOne({
      where: { id: req.params.id },

      include: [
        {
          model: Product,
          where: {
            status: "published",
            type: "session",
          },
        },
      ],
    });

    if (!session) {
      return res.status(404).json({
        message: "Not found",
      });
    }

    res.json(session);

  } catch (err) {

    console.error("PUBLIC SESSION ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });
  }
});


/* ================= EXPORT ================= */

module.exports = router;
