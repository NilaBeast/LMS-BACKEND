const Package = require("../models/Package.model");
const PackagePurchase = require("../models/PackagePurchase.model");
const Enrollment = require("../models/Enrollment.model");
const Course = require("../models/Course.model");
const User = require("../models/User.model");
const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");

exports.buyPackage = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id } = req.params;

    const pack = await Package.findByPk(id, {
      include: [Course],
    });

    if (!pack) {
      return res.status(404).json({ message: "Package not found" });
    }

    const existing = await PackagePurchase.findOne({
      where: { userId, packageId: id },
    });

    if (existing) {
      return res.json({ message: "Already purchased" });
    }

    await PackagePurchase.create({
      userId,
      packageId: id,
    });

    for (const course of pack.Courses) {
      await Enrollment.findOrCreate({
        where: { userId, courseId: course.id },
      });
    }

    const user = await User.findByPk(userId);

    const html = emailLayout(
      "Package Purchase Confirmation",
      `
      <h2>🎉 Purchase Confirmed</h2>
      <p><strong>Package:</strong> ${pack.title}</p>
      <ul>
        ${pack.Courses.map(c => `<li>${c.name}</li>`).join("")}
      </ul>
      <p>Date: ${new Date().toDateString()}</p>
      `
    );

    await mailer.sendMail(
      user.email,
      "Package Purchase Successful",
      html
    );

    res.json({ message: "Package purchased successfully" });

  } catch (err) {
    console.error("PACKAGE PURCHASE ERROR:", err);
    res.status(500).json({ message: "Purchase failed" });
  }
};