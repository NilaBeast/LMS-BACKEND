const Product = require("../models/Product.model");
const Package = require("../models/Package.model");
const PackageCourse = require("../models/PackageCourse.model");
const Course = require("../models/Course.model");
const Business = require("../models/Business.model");
const { sequelize } = require("../config/db");
const jwt = require("jsonwebtoken");
const PackagePurchase = require("../models/PackagePurchase.model");


/* ================= CREATE PACKAGE ================= */

exports.createPackage = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      description,
      pricingType,
      pricing,
      pricingBreakdown,
      viewBreakdown,
      businessId,
    } = req.body;

    if (!title || !pricingType || !pricing || !businessId) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const business = await Business.findOne({
      where: { id: businessId, userId: req.user.id },
      transaction,
    });

    if (!business) {
      await transaction.rollback();
      return res.status(403).json({ message: "Invalid business access" });
    }

    const product = await Product.create(
      {
        businessId: business.id,
        type: "package",
        status: "draft",
      },
      { transaction }
    );

    const pack = await Package.create(
      {
        productId: product.id,

        // ✅ VERY IMPORTANT FIX
        businessId: business.id,

        title,
        description,
        banner: req.file?.path || null,
        pricingType,
        pricing:
          typeof pricing === "string"
            ? JSON.parse(pricing)
            : pricing,
        pricingBreakdown: pricingBreakdown
          ? JSON.parse(pricingBreakdown)
          : null,
        viewBreakdown:
          viewBreakdown === "true" || viewBreakdown === true,
      },
      { transaction }
    );

    await transaction.commit();

    res.status(201).json(pack);

  } catch (err) {

    await transaction.rollback();

    console.error("CREATE PACKAGE ERROR:", err);

    res.status(500).json({
      message: "Package creation failed",
      error: err.message,
    });
  }
};

/* ================= UPDATE PACKAGE ================= */

exports.updatePackage = async (req, res) => {
  try {
    let {
      title,
      description,
      pricingType,
      pricing,
      pricingBreakdown,
      viewBreakdown,
    } = req.body;

    const pack = await Package.findOne({
      where: { id: req.params.id },
      include: [
        {
          model: Product,
          include: [
            {
              model: Business,
              where: { userId: req.user.id },
            },
          ],
        },
      ],
    });

    if (!pack) {
      return res
        .status(404)
        .json({ message: "Package not found" });
    }

    /* ================= FIX TYPES ================= */

    // Parse pricing safely
    if (pricing && typeof pricing === "string") {
      try {
        pricing = JSON.parse(pricing);
      } catch {
        pricing = null;
      }
    }

    if (
      pricingBreakdown &&
      typeof pricingBreakdown === "string"
    ) {
      try {
        pricingBreakdown =
          JSON.parse(pricingBreakdown);
      } catch {
        pricingBreakdown = null;
      }
    }

    // Convert boolean
    if (viewBreakdown !== undefined) {
      viewBreakdown =
        viewBreakdown === "true" ||
        viewBreakdown === true;
    }

    /* ================= UPDATE ================= */

    if (title !== undefined)
      pack.title = title;

    if (description !== undefined)
      pack.description = description;

    if (pricingType !== undefined)
      pack.pricingType = pricingType;

    if (pricing !== undefined)
      pack.pricing = pricing;

    if (pricingBreakdown !== undefined)
      pack.pricingBreakdown = pricingBreakdown;

    if (viewBreakdown !== undefined)
      pack.viewBreakdown = viewBreakdown;

    if (req.file) {
      pack.banner = req.file.path;
    }

    await pack.save();

    res.json(pack);

  } catch (err) {
    console.error("UPDATE PACKAGE ERROR:", err);
    res.status(500).json({
      message: "Update failed",
      error: err.message,
    });
  }
};

/* ================= DELETE PACKAGE ================= */

exports.deletePackage = async (req, res) => {
  const { productId } = req.params;

  const transaction = await sequelize.transaction();

  try {
    const product = await Product.findByPk(productId, { transaction });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const pack = await Package.findOne({
      where: { productId },
      transaction,
    });

    if (!pack) {
      return res.status(404).json({ message: "Package not found" });
    }

    // ✅ DELETE DEPENDENCIES FIRST

    await PackageCourse.destroy({
      where: { packageId: pack.id },
      transaction,
    });

    await PackagePurchase.destroy({
      where: { packageId: pack.id },
      transaction,
    });

    // ✅ DELETE PACKAGE
    await pack.destroy({ transaction });

    // ✅ DELETE PRODUCT
    await product.destroy({ transaction });

    await transaction.commit();

    res.json({ message: "Package deleted successfully" });

  } catch (err) {
    await transaction.rollback();
    console.error("DELETE PACKAGE ERROR:", err);
    res.status(500).json({
      message: "Delete failed",
      error: err.message,
    });
  }
};

/* ================= ADD COURSE ================= */

exports.addCourseToPackage = async (req, res) => {
  try {
    const { packageId, courseId } = req.body;

    const pack = await Package.findOne({
      where: { id: packageId },
      include: [
        {
          model: Product,
          include: [
            {
              model: Business,
              where: { userId: req.user.id },
            },
          ],
        },
      ],
    });

    if (!pack) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    const lastOrder =
      (await PackageCourse.max("order", {
        where: { packageId },
      })) || 0;

    await PackageCourse.create({
      packageId,
      courseId,
      order: lastOrder + 1,
    });

    res.json({ message: "Course added" });
  } catch (err) {
    res.status(500).json({ message: "Failed" });
  }
};

/* ================= REORDER ================= */

exports.reorderPackageCourses = async (req, res) => {
  const { courses } = req.body;

  for (const c of courses) {
    await PackageCourse.update(
      { order: c.order },
      { where: { id: c.id } }
    );
  }

  res.json({ message: "Reordered successfully" });
};

exports.getPublicPackage = async (req, res) => {
  try {
    let userId = null;

    /* ================= GET USER FROM TOKEN ================= */

    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];

      try {
        const decoded = jwt.verify(
          token,
          process.env.JWT_SECRET
        );

        userId = decoded.id;

      } catch (err) {
        console.log("Invalid token");
      }
    }

    /* ================= LOAD PACKAGE ================= */

    const pack = await Package.findOne({
      where: {
        id: req.params.id,
      },

      include: [
        {
          model: Course,
          include: [
            {
              model: Chapter,
              include: [Content],
            },
          ],
        },
      ],
    });

    if (!pack) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    /* ================= CHECK PURCHASE ================= */

    let isPurchased = false;

    if (userId) {
      const purchased = await PackagePurchase.findOne({
        where: {
          userId,
          packageId: pack.id,
        },
      });

      if (purchased) {
        isPurchased = true;
      }
    }

    /* ================= RESPONSE ================= */

    res.json({
      ...pack.toJSON(),
      isPurchased, // ✅ IMPORTANT
    });

  } catch (err) {
    console.error("PUBLIC PACKAGE ERROR:", err);

    res.status(500).json({
      message: "Failed to load package",
      error: err.message,
    });
  }
};

/*===================REMOVE COURSES FROM PACKAGE================*/
exports.removeCourseFromPackage = async (req, res) => {
  try {

    const { packageId, courseId } = req.params;

    const pkg = await Package.findByPk(packageId);

    if (!pkg) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    // Get business manually
    const business = await Business.findOne({
      where: { id: pkg.businessId },
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    if (business.userId !== req.user.id) {
      console.log("User mismatch:");
      console.log("Logged:", req.user.id);
      console.log("Owner:", business.userId);

      return res.status(403).json({
        message: "Unauthorized",
      });
    }

    await PackageCourse.destroy({
      where: {
        packageId,
        courseId,
      },
    });

    res.json({
      success: true,
    });

  } catch (err) {

    console.error("REMOVE COURSE ERROR:", err);

    res.status(500).json({
      message: "Failed",
    });
  }
};