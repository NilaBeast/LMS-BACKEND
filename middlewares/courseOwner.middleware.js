// middlewares/courseOwner.middleware.js
const Course = require("../models/Course.model");
const Product = require("../models/Product.model");
const Business = require("../models/Business.model");

exports.isCourseOwner = async (req, res, next) => {
  const { courseId } = req.params;

  const course = await Course.findOne({
    where: { id: courseId },
    include: [
      {
        model: Product,
        include: [{ model: Business }],
      },
    ],
  });

  if (!course || course.Product.Business.userId !== req.user.id) {
    return res.status(403).json({ message: "Access denied" });
  }

  req.course = course;
  next();
};
