const express = require("express");
const router = express.Router();

const Course = require("../models/Course.model");
const Product = require("../models/Product.model");
const Event = require("../models/Event.model");

const Quiz = require("../models/Quiz.model");
const QuizQuestion = require("../models/QuizQuestion.model");

const Session = require("../models/Session.model");

const Chapter = require("../models/Chapter.model");
const Content = require("../models/Content.model");

const DigitalFile = require("../models/DigitalFile.model");

const Package = require("../models/Package.model");
const PackagePurchase = require("../models/PackagePurchase.model");

const Membership = require("../models/Membership.model");
const MembershipPricing = require("../models/MembershipPricing.model");
const MembershipQuestion = require("../models/MembershipQuestion.model");
const MembershipQuestionOption = require("../models/MembershipQuestionOption.model");
const MembershipPurchase = require("../models/MembershipPurchase.model");

const { protectOptional } = require("../middlewares/auth.middleware");
const checkMembershipAccess = require("../utils/checkMembershipAccess");



/* =======================================================
   COURSES
======================================================= */

router.get("/courses", async (req, res) => {
  try {

    const courses = await Course.findAll({
      include: [
        {
          model: Product,
          where: { status: "published" },
          attributes: [
            "id",
            "status",
            "membershipRequired",
            "membershipPlanIds"
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(courses);

  } catch (err) {

    console.error("PUBLIC COURSES ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }
});


router.get("/courses/:id", protectOptional, async (req, res) => {

  try {

    const course = await Course.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Product,
          where: { status: "published" },
        },
      ],
    });

    if (!course) {
      return res.status(404).json({
        message: "Course not found",
      });
    }

    const allowed = await checkMembershipAccess(
      course.Product,
      req.user
    );

    if (!allowed) {
      return res.status(403).json({
        message: "This course requires membership",
      });
    }

    res.json(course);

  } catch (err) {

    console.error("PUBLIC COURSE ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }

});



/* =======================================================
   EVENTS
======================================================= */

router.get("/events", protectOptional, async (req, res) => {
  try {

    const events = await Event.findAll({
      include: [
        {
          model: Product,
          where: { status: "published" },
        },
      ],
      order: [["startAt", "ASC"]],
    });

    const filtered = [];

    for (const event of events) {

      const allowed = await checkMembershipAccess(
        event.Product,
        req.user
      );

      if (allowed) filtered.push(event);

    }

    res.json(filtered);

  } catch (err) {

    console.error("PUBLIC EVENTS ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }
});



/* =======================================================
   QUIZ
======================================================= */

router.get("/quiz/:chapterId", async (req, res) => {

  try {

    const quiz = await Quiz.findOne({
      where: { chapterId: req.params.chapterId },
      include: [{ model: QuizQuestion }],
    });

    if (!quiz) {
      return res.status(404).json({
        message: "Quiz not found",
      });
    }

    res.json(quiz);

  } catch (err) {

    console.error("PUBLIC QUIZ ERROR:", err);

    res.status(500).json({
      message: "Failed to load quiz",
    });

  }

});



/* =======================================================
   SESSIONS
======================================================= */

router.get("/sessions", protectOptional, async (req, res) => {

  try {

    const sessions = await Session.findAll({
      include: [
        {
          model: Product,
          where: { status: "published", type: "session" },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const filtered = [];

    for (const session of sessions) {

      const allowed = await checkMembershipAccess(
        session.Product,
        req.user
      );

      if (allowed) filtered.push(session);

    }

    res.json(filtered);

  } catch (err) {

    console.error("PUBLIC SESSIONS ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }

});



/* =======================================================
   DIGITAL FILES
======================================================= */

router.get("/digital-files", protectOptional, async (req, res) => {
  try {

    const files = await DigitalFile.findAll({
      include: [
        {
          model: Product,
          where: { status: "published", type: "digital" },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const result = [];

    for (const file of files) {

      let locked = false;

      if (file.Product.membershipRequired) {

        const allowed = await checkMembershipAccess(
          file.Product,
          req.user
        );

        if (!allowed) locked = true;

      }

      const item = file.toJSON();
      item.locked = locked;

      result.push(item);

    }

    res.json(result);

  } catch (err) {

    console.error("PUBLIC DIGITAL ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }
});



/* =======================================================
   PACKAGES
======================================================= */

router.get("/packages", protectOptional, async (req, res) => {

  try {

    const packages = await Package.findAll({
      include: [
        {
          model: Product,
          where: { status: "published", type: "package" },
        },
      ],
    });

    const result = [];

for (const pack of packages) {

  let locked = false;

  if (pack.Product.membershipRequired) {

    const allowed = await checkMembershipAccess(
      pack.Product,
      req.user
    );

    if (!allowed) locked = true;

  }

  const item = pack.toJSON();
  item.locked = locked;

  result.push(item);

}

res.json(result);
  } catch (err) {

    console.error("PUBLIC PACKAGE ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }

});


router.get("/packages/:id", protectOptional, async (req, res) => {

  try {

    const pack = await Package.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Product,
          where: { status: "published", type: "package" },
        },
      ],
    });

    if (!pack) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    let locked = false;

if (pack.Product.membershipRequired) {

  const allowed = await checkMembershipAccess(
    pack.Product,
    req.user
  );

  if (!allowed) locked = true;

}

    let isPurchased = false;

    if (req.user) {

      const found = await PackagePurchase.findOne({
        where: {
          userId: req.user.id,
          packageId: pack.id,
        },
      });

      if (found) isPurchased = true;

    }

    res.json({
  ...pack.toJSON(),
  isPurchased,
  locked,
});

  } catch (err) {

    console.error("PUBLIC PACKAGE ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }

});



/* =======================================================
   MEMBERSHIPS
======================================================= */

router.get("/memberships", async (req, res) => {

  try {

    const memberships = await Membership.findAll({
      include: [
        {
          model: Product,
          where: { status: "published", type: "membership" },
        },
        MembershipPricing,
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(memberships);

  } catch (err) {

    console.error("PUBLIC MEMBERSHIP ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }

});


router.get("/memberships/:id", protectOptional, async (req, res) => {

  try {

    const membership = await Membership.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Product,
          where: { status: "published", type: "membership" },
        },
        MembershipPricing,
        {
          model: MembershipQuestion,
          include: [MembershipQuestionOption],
        },
      ],
    });

    if (!membership) {
      return res.status(404).json({
        message: "Membership not found",
      });
    }

    let isPurchased = false;
    let purchaseStatus = null;

    if (req.user) {

      const purchase = await MembershipPurchase.findOne({
        where: {
          userId: req.user.id,
          membershipId: membership.id,
        },
      });

      if (purchase) {
        isPurchased = true;
        purchaseStatus = purchase.status;
      }

    }

    res.json({
      ...membership.toJSON(),
      isPurchased,
      purchaseStatus,
    });

  } catch (err) {

    console.error("PUBLIC MEMBERSHIP SINGLE ERROR:", err);

    res.status(500).json({
      message: "Load failed",
    });

  }

});



/* =======================================================
   EXPORT
======================================================= */

module.exports = router;