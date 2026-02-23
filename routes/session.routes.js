const router = require("express").Router();

const { protect, protectOptional } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/sessionUpload");

const {
  createSession,
  updateSession,
  deleteSession,
  getBookings,
  bookSession,
  getMySessions,
  getPublicSession,
  getPublicSessions
} = require("../controllers/session.controller");


router.post("/", protect, upload.single("banner"), createSession);

router.patch("/:id", protect, upload.single("banner"), updateSession);

router.delete("/:id", protect, deleteSession);

router.get("/my", protect, getMySessions);

router.get("/:id/bookings", protect, getBookings);

router.post("/:id/book", protect, bookSession);

router.get("/public", getPublicSessions);

router.get(
  "/public/:id",
  protectOptional,
  getPublicSession
);


module.exports = router;