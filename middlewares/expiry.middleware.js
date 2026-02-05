const Enrollment = require("../models/Enrollment.model");

exports.checkExpiry = async (req, res, next) => {
  const enrollment = await Enrollment.findOne({
    where: {
      userId: req.user.id,
      courseId: req.params.courseId,
    },
  });

  if (enrollment?.expiresAt) {
    if (new Date() > enrollment.expiresAt) {
      return res.status(403).json({
        message: "Course access expired",
      });
    }
  }

  next();
};
