const express = require("express");
const router = express.Router();

const { protect, protectOptional } = require("../middlewares/auth.middleware");
const upload = require("../middlewares/upload.middleware");

const Package = require("../models/Package.model");
const Product = require("../models/Product.model");
const Business = require("../models/Business.model");
const Course = require("../models/Course.model");
const PackageCourse = require("../models/PackageCourse.model");

const {
  createPackage,
  updatePackage,
  deletePackage,
  addCourseToPackage,
  reorderPackageCourses,
  getPublicPackage,
  removeCourseFromPackage,
} = require("../controllers/package.controller");

/* ================= PACKAGE ================= */

// CREATE
router.post("/", protect, upload.single("banner"), createPackage);

// UPDATE
router.put("/:id", protect, upload.single("banner"), updatePackage);

// DELETE (by product id)
router.delete("/product/:productId", protect, deletePackage);

/* ================= GET MY PACKAGES ================= */

router.get("/my", protect, async (req, res) => {
  try {
    const packages = await Package.findAll({
      include: [
        {
          model: Product,
          where: {
            type: "package",
          },
          include: [
            {
              model: Business,
              where: {
                userId: req.user.id,
              },
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(packages);

  } catch (err) {
    console.error("MY PACKAGES ERROR:", err);

    res.status(500).json({
      message: "Failed to load packages",
      error: err.message,
    });
  }
});

/* ================= COURSES ================= */

router.post("/add-course", protect, addCourseToPackage);

router.patch("/reorder", protect, reorderPackageCourses);

/* ================= GET SINGLE PACKAGE (OWNER) ================= */

router.get("/:id", protect, async (req, res) => {
  try {
    const pack = await Package.findOne({
      where: {
        id: req.params.id,
      },

      include: [
        {
          model: Product,
          include: [
            {
              model: Business,
              where: {
                userId: req.user.id,
              },
            },
          ],
        },

        {
          model: Course,

          through: {
            attributes: ["id", "order"],
          },
        },
      ],

      // ✅ Correct ordering via join table
      order: [[Course, PackageCourse, "order", "ASC"]],
    });

    if (!pack) {
      return res.status(404).json({
        message: "Package not found",
      });
    }

    res.json(pack);

  } catch (err) {
    console.error("GET PACKAGE ERROR:", err);

    res.status(500).json({
      message: "Failed to load package",
      error: err.message,
    });
  }
});

//=================REMOVE COURSES FROM PACKAGE ROUTE=============//
router.delete(
  "/:packageId/course/:courseId",
  protect,
  removeCourseFromPackage
);

/* ================= PUBLIC PACKAGE ================= */

router.get("/public/:id", protectOptional, getPublicPackage);

module.exports = router;