const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");
const Course = require("../models/Course.model");
const Product = require("../models/Product.model");
const Business = require("../models/Business.model");
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

router.get("/my", protect, async (req, res) => {
  try {
    const courses = await Course.findAll({
      include: [
        {
          model: Product,
          include: [
            {
              model: Business,
              where: {
                userId: req.user.id,
              },
            },
          ],
          where: {
            type: "course",
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(courses);

  } catch (err) {
    console.error("MY COURSES ERROR:", err);
    res.status(500).json({
      message: "Failed to load courses",
    });
  }
});
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
