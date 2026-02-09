const Enrollment = require("../models/Enrollment.model");
const Course = require("../models/Course.model");
const Product = require("../models/Product.model");
const CourseRoom = require("../models/CourseRoom.model");
const Business = require("../models/Business.model");
const User = require("../models/User.model");
const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");

exports.enrollCourse = async (req, res) => {
  try {
    const { courseId } = req.body;
    const userId = req.user.id;

    let expiresAt = null;

    if (!courseId) {
      return res.status(400).json({ message: "Course ID required" });
    }

    // ✅ COURSE MUST BE PUBLISHED
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

    /* =================================================
       NEW: AUTO CALCULATE EXPIRY FROM COURSE SETTINGS
    ================================================= */

    if (course.isLimited) {

      // Fixed Date
      if (course.accessType === "fixed_date") {
        expiresAt = course.expiryDate;
      }

      // Days from enrollment
      if (course.accessType === "days") {
        const d = new Date();
        d.setDate(d.getDate() + course.accessDays);
        expiresAt = d;
      }
    }

    /* ================================================= */

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
      expiresAt,
    });

    /* ================= SEND MAIL ================= */

    const html = emailLayout(
      "Enrollment Successful",
      `
      <h2 style="color:#0f172a;">✅ Enrollment Confirmed</h2>

      <p>Hello <strong>${req.user.name}</strong>,</p>

      <p>You have successfully enrolled in:</p>

      <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
        <p><strong>Course:</strong> ${course.name}</p>
        <p><strong>Enrolled On:</strong> ${new Date().toDateString()}</p>

        ${
          expiresAt
            ? `<p><strong>Access Till:</strong> ${new Date(
                expiresAt
              ).toDateString()}</p>`
            : ""
        }
      </div>

      <p>Happy Learning! 📘</p>

      <p>— Team Techzuno</p>
      `
    );

    await mailer.sendMail(
      req.user.email,
      "📘 Enrollment Successful – Start Learning",
      html
    );

    /* ================= AUTO ROOM ================= */

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

    res.json({
      message: "Enrolled successfully",
      expiresAt,
    });

  } catch (err) {
    console.error("ENROLL ERROR:", err);
    res.status(500).json({ message: "Enrollment failed" });
  }
};


exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id },

      attributes: [
        "courseId",
        "expiresAt",
        "enrolledAt",
      ],

      include: [
        {
          model: Course,
          attributes: [
            "id",
            "isLimited",
            "accessType",
          ],
        },
      ],
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
