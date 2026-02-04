const Enrollment = require("../models/Enrollment.model");
const Course = require("../models/Course.model");
const Product = require("../models/Product.model");
const Business = require("../models/Business.model");

/**
 * CHECK ROOM ACCESS
 */
exports.canAccessRoom = async (req, res, next) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findOne({
      where: { id: courseId },
      include: [
        {
          model: Product,
          include: [
            {
              model: Business,
            },
          ],
        },
      ],
    });

    if (!course || !course.hasRoom) {
      return res.status(403).json({ message: "Room not available" });
    }

    // 👑 course owner (admin)
    if (course.Product.Business.userId === req.user.id) {
      return next();
    }

    // 👤 enrolled user
    const enrolled = await Enrollment.findOne({
      where: {
        userId: req.user.id,
        courseId,
      },
    });

    if (!enrolled) {
      return res.status(403).json({ message: "Enroll to access room" });
    }

    next();
  } catch (err) {
    console.error("ROOM ACCESS ERROR:", err);
    res.status(500).json({ message: "Room access failed" });
  }
};
