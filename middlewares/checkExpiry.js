const Enrollment = require("../models/Enrollment.model");

module.exports = async (req, res, next) => {
  const { courseId } = req.params;

  const enroll = await Enrollment.findOne({
    where: {
      userId: req.user.id,
      courseId,
    },
  });

  if (!enroll) {
    return res.status(403).json({ message: "Not enrolled" });
  }

  if (enroll.expiresAt && new Date() > enroll.expiresAt) {
    return res.status(403).json({
      message: "Course access expired",
    });
  }

  next();
};
