const Enrollment = require("../models/Enrollment.model");
const Course = require("../models/Course.model");
const Product = require("../models/Product.model");
const CourseRoom = require("../models/CourseRoom.model");
const Business = require("../models/Business.model");
const User = require("../models/User.model");

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID required" });
    }

    // ✅ COURSE MUST BE PUBLISHED (PRODUCT.STATUS)
    const course = await Course.findOne({
      where: { id: courseId },
      include: [
        {
          model: Product,
          required: true,
          where: { status: "published" },
        },
      ],
    });

    if (!course) {
      return res
        .status(404)
        .json({ message: "Course not available" });
    }

    // ✅ Prevent duplicate enrollment
    const exists = await Enrollment.findOne({
      where: { userId, courseId },
    });

    if (exists) {
      return res.json({ message: "Already enrolled" });
    }

    // ✅ Create enrollment
    await Enrollment.create({
      userId,
      courseId,
      businessId: course.Product.businessId,
    });

    // ✅ AUTO-CREATE ROOM (CRITICAL FIX)
    if (course.hasRoom) {
      const existingRoom = await CourseRoom.findOne({
        where: { courseId },
      });

      if (!existingRoom) {
        await CourseRoom.create({
          courseId,
          businessId: course.Product.businessId,
        });
      }
    }

    res.json({ message: "Enrolled successfully" });
  } catch (err) {
    console.error("ENROLL ERROR:", err);
    res.status(500).json({ message: "Enrollment failed" });
  }
};

exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id },
      attributes: ["courseId"],
    });

    res.json(enrollments);
  } catch (err) {
    console.error("GET MY ENROLLMENTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch enrollments" });
  }
};

exports.getEnrolledUsersByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    // 🔒 Verify course belongs to admin
    const course = await Course.findOne({
      where: { id: courseId },
      include: [
        {
          model: Product,
          required: true,
          include: [
            {
              model: Business,
              where: { userId: req.user.id },
            },
          ],
        },
      ],
    });

    if (!course) {
      return res.status(403).json({ message: "Access denied" });
    }

    const enrollments = await Enrollment.findAll({
      where: { courseId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(enrollments);
  } catch (err) {
    console.error("GET ENROLLED USERS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch enrolled users" });
  }
};
