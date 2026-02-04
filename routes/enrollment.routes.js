const express = require("express");
const router = express.Router();

const {protect} = require("../middlewares/auth.middleware");
const {enrollCourse, getMyEnrollments, getEnrolledUsersByCourse} = require("../controllers/enrollment.controller");

router.post("/", protect, enrollCourse);

router.get("/my", protect, getMyEnrollments);

router.get(
  "/course/:courseId",
  protect,
  getEnrolledUsersByCourse
);

module.exports = router;