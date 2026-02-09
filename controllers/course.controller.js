const Product = require("../models/Product.model");
const Course = require("../models/Course.model");
const Coupon = require("../models/Coupon.model");
const Business = require("../models/Business.model");
const Enrollment = require("../models/Enrollment.model");
const { sequelize } = require("../config/db");
const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");

/**
 * CREATE COURSE (MULTI-BUSINESS SAFE)
 */
exports.createCourse = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      name,
      description,
      pricingType,
      pricing,
      pricingBreakdown,
      viewBreakdown,
      hasRoom,
      roomConfig,
      businessId,

      // NEW
      isLimited,
      accessType,
      expiryDate,
      accessDays,
    } = req.body;

    if (!name || !pricingType || !pricing || !businessId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const parsedPricing =
      typeof pricing === "string" ? JSON.parse(pricing) : pricing;

    const business = await Business.findOne({
      where: {
        id: businessId,
        userId: req.user.id,
      },
      transaction,
    });

    if (!business) {
      await transaction.rollback();
      return res.status(403).json({ message: "Invalid business access" });
    }

    const product = await Product.create(
      {
        businessId: business.id,
        type: "course",
        status: "draft",
      },
      { transaction }
    );

    const course = await Course.create(
      {
        productId: product.id,
        name,
        description,
        coverImage: req.file?.path || null,
        pricingType,
        pricing: parsedPricing,
        pricingBreakdown: pricingBreakdown
          ? JSON.parse(pricingBreakdown)
          : null,
        viewBreakdown: viewBreakdown === "true",
        hasRoom: hasRoom === "true",

        roomConfig: roomConfig ? JSON.parse(roomConfig) : null,

        /* NEW */

        isLimited: isLimited === "true",
        accessType: isLimited === "true" ? accessType : null,
        expiryDate: accessType === "fixed_date" ? expiryDate : null,
        accessDays: accessType === "days" ? accessDays : null,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json(course);
  } catch (err) {
    await transaction.rollback();

    console.error("CREATE COURSE ERROR:", err);
    res.status(500).json({ message: "Course creation failed" });
  }
};


/**
 * GET ALL MY COURSES (ALL BUSINESSES)
 */
exports.getMyCourses = async (req, res) => {
  try {
    // 🔹 Get all businesses of user
    const businesses = await Business.findAll({
      where: { userId: req.user.id },
    });

    if (businesses.length === 0) {
      return res.json([]);
    }

    const businessIds = businesses.map((b) => b.id);

    // 🔹 Get products for all businesses
    const products = await Product.findAll({
      where: {
        businessId: businessIds,
        type: "course",
      },
      order: [["createdAt", "DESC"]],
    });

    if (products.length === 0) {
      return res.json([]);
    }

    const productIds = products.map((p) => p.id);

    const courses = await Course.findAll({
      where: { productId: productIds },
      order: [["createdAt", "DESC"]],
    });

    // 🔹 Attach Product to Course
    const merged = courses.map((course) => {
      const product = products.find(
        (p) => p.id === course.productId
      );

      return {
        ...course.toJSON(),
        Product: product,
      };
    });

    res.json(merged);
  } catch (err) {
    console.error("GET MY COURSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch courses" });
  }
};

/**
 * GET SINGLE COURSE (BUSINESS SCOPED)
 */
exports.getCourseById = async (req, res) => {
  try {
    const course = await Course.findOne({
      where: { id: req.params.id },
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
        {
          model: Coupon,
        },
      ],
    });

    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    res.json(course);
  } catch (err) {
    console.error("GET COURSE ERROR:", err);
    res.status(500).json({ message: "Failed to fetch course" });
  }
};

/**
 * UPDATE COURSE (BUSINESS SCOPED)
 */
exports.updateCourse = async (req, res) => {
  try {
    const {
      name,
      description,
      pricingType,
      pricing,
      viewBreakdown,

      isLimited,
      accessType,
      expiryDate,
      accessDays,
    } = req.body;

    const parsedPricing =
      pricing !== undefined
        ? typeof pricing === "string"
          ? JSON.parse(pricing)
          : pricing
        : undefined;

    const course = await Course.findOne({
      where: { id: req.params.id },
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
      return res.status(404).json({ message: "Course not found" });
    }

    /* ================= BASIC UPDATE ================= */

    course.name = name ?? course.name;
    course.description = description ?? course.description;
    course.pricingType = pricingType ?? course.pricingType;
    course.pricing = parsedPricing ?? course.pricing;
    course.viewBreakdown = viewBreakdown ?? course.viewBreakdown;

    if (req.file) {
      course.coverImage = req.file.path;
    }

    /* ================= ACCESS UPDATE ================= */

    if (isLimited !== undefined) {

      const limited = isLimited === "true" || isLimited === true;

      course.isLimited = limited;

      if (limited) {

        course.accessType = accessType;

        // FIXED DATE
        if (accessType === "fixed_date") {
          course.expiryDate = expiryDate;
          course.accessDays = null;
        }

        // DAYS (Do NOT touch old enrollments)
        if (accessType === "days") {
          course.accessDays = accessDays;
          course.expiryDate = null;
        }

      } else {
        // Switch to unlimited
        course.isLimited = false;
        course.accessType = null;
        course.expiryDate = null;
        course.accessDays = null;
      }
    }

    await course.save();

    /* ================= SYNC OLD ENROLLMENTS ================= */

    // Only for FIXED DATE (everyone same expiry)
    if (
      isLimited !== undefined &&
      course.isLimited &&
      course.accessType === "fixed_date"
    ) {
      await Enrollment.update(
        {
          expiresAt: course.expiryDate,
        },
        {
          where: { courseId: course.id },
        }
      );
    }

    // If admin removes limit → make unlimited
    if (isLimited !== undefined && !course.isLimited) {
      await Enrollment.update(
        {
          expiresAt: null,
        },
        {
          where: { courseId: course.id },
        }
      );
    }

    /* ======================================================= */

    res.json(course);

  } catch (err) {

    console.error("UPDATE COURSE ERROR:", err);

    res.status(500).json({
      message: "Failed to update course",
    });
  }
};



/**
 * DELETE COURSE (BUSINESS SCOPED)
 */
/**
 * DELETE COURSE
 */
exports.deleteCourse = async (req, res) => {
  try {
    // 1️⃣ Find product ONLY by ID & type
    const product = await Product.findOne({
      where: {
        id: req.params.productId,
        type: "course",
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Course not found" });
    }

    // 2️⃣ Verify ownership manually
    const business = await Business.findOne({
      where: {
        id: product.businessId,
        userId: req.user.id,
      },
    });

    if (!business) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // 3️⃣ Delete product (CASCADE deletes course)
    await product.destroy();

    res.json({ message: "Course deleted successfully" });
  } catch (err) {
    console.error("DELETE COURSE ERROR:", err);
    res.status(500).json({ message: "Failed to delete course" });
  }
};

exports.getCourseMoreInfo = async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  res.json({
    settings: course.courseSettings,
    pricing: course.pricing,
    room: course.hasRoom,
    breakdown: course.pricingBreakdown,
  });
};

exports.updateCourseSettings = async (req, res) => {
  const course = await Course.findByPk(req.params.id);

  course.courseSettings = req.body;

  await course.save();

  res.json(course.courseSettings);
};
