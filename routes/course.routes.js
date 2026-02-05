const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const {
  createCourse,
  getMyCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  getCourseMoreInfo,
  updateCourseSettings,
} = require("../controllers/course.controller");

/* ================= COURSES ================= */

// CREATE
router.post("/", protect, upload.single("coverImage"), createCourse);

// 🔥 FIX: MY COURSES
router.get("/my", protect, getMyCourses);

// SINGLE COURSE (ADMIN / OWNER)
router.get("/:id", protect, getCourseById);

// UPDATE
router.put("/:id", protect, upload.single("coverImage"), updateCourse);

// DELETE
router.delete("/product/:productId", protect, deleteCourse);

router.get("/:id/more-info", protect, getCourseMoreInfo);

router.patch("/:id/settings", protect, updateCourseSettings);



module.exports = router;
