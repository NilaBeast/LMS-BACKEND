const express = require("express");
const router = express.Router();

const upload = require("../middlewares/upload.middleware");
const { protect } = require("../middlewares/auth.middleware");

const {
  createEvent,
  updateEvent,
  deleteEvent,

  registerForEvent,

  getMyEvents,
  getPublicEvents,
  getPublicEventById,

  getMyRegistrations,
  checkEventRegistration,
  updateEventSettings,
  getEventByIdForHost,
  approveRegistration,
} = require("../controllers/event.controller");

const {
  addQuestion,
  getQuestions,
  updateQuestion,
  deleteQuestion,
} = require("../controllers/eventQuestion.controller");

const {
  getEventAttendees,
} = require("../controllers/eventAttendee.controller");



/* ================= PUBLIC ================= */

router.get("/public", getPublicEvents);
router.get("/public/:id", getPublicEventById);


/* ================= USER ================= */

router.post(
  "/registrations/:id/approve",
  protect,
  approveRegistration
);


router.post("/:eventId/register", protect, registerForEvent);

router.get("/my-registrations", protect, getMyRegistrations);

router.get(
  "/:eventId/check",
  protect,
  checkEventRegistration
);


/* ================= ADMIN ================= */

router.get("/my", protect, getMyEvents);

router.post(
  "/",
  protect,
  upload.single("coverMedia"),
  createEvent
);

/* ================= EVENT SETTINGS ================= */

router.patch(
  "/:id/settings",
  protect,
  updateEventSettings
);


/* ================= HOST SINGLE EVENT ================= */

router.get(
  "/:id",
  protect,
  getEventByIdForHost
);


router.put(
  "/:id",
  protect,
  upload.single("coverMedia"),
  updateEvent
);

router.delete(
  "/:id",
  protect,
  deleteEvent
);

/* ================= QUESTIONS ================= */

router.post("/:eventId/questions", protect, addQuestion);

router.get("/:eventId/questions", protect, getQuestions);

router.put("/questions/:id", protect, updateQuestion);


router.delete("/questions/:id", protect, deleteQuestion);


/* ================= ATTENDEES ================= */

router.get("/:eventId/attendees", protect, getEventAttendees);


module.exports = router;
