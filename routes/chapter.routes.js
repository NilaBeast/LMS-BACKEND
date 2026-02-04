const router = require("express").Router();
const { protect } = require("../middlewares/auth.middleware");
const { isCourseOwner } = require("../middlewares/courseOwner.middleware");
const { isEnrolled } = require("../middlewares/isEnrolled.middleware");

const {
  createChapter,
  getChaptersByCourse,
  reorderChapters,
  getCourseChapters
} = require("../controllers/chapter.controller");

// CREATE CHAPTER
router.post("/:courseId", protect, isCourseOwner, createChapter);

// 🔥 REQUIRED: LOAD CHAPTERS (FIXES REFRESH ISSUE)
router.get("/:courseId", protect, isCourseOwner, getChaptersByCourse);

// REORDER CHAPTERS
router.patch("/:courseId/reorder", protect, isCourseOwner, reorderChapters);

/* 🔒 STUDENT ACCESS (LIKE ROOM) */
router.get(
  "/:courseId/structure",
  protect,
  isEnrolled,
  getCourseChapters
);

module.exports = router;
