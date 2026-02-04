const Enrollment = require("../models/Enrollment.model");

exports.isEnrolled = async (req, res, next) => {
  const userId = req.user.id;
  const { courseId } = req.params;

  const enrolled = await Enrollment.findOne({
    where: { userId, courseId },
  });

  if (!enrolled) {
    return res.status(403).json({ message: "Not enrolled" });
  }

  next();
};
