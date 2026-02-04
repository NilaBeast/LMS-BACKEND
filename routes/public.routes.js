const express = require("express");
const router = express.Router();

const Course = require("../models/Course.model");
const Product = require("../models/Product.model");

/**
 * GET ALL PUBLISHED COURSES (PUBLIC)
 */
router.get("/courses", async (req, res) => {
  const courses = await Course.findAll({
    include: [
      {
        model: Product,
        where: { status: "published" },
        attributes: ["status"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });

  res.json(courses);
});

/**
 * GET SINGLE COURSE (PUBLIC)
 */
router.get("/courses/:id", async (req, res) => {
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
    return res.status(404).json({ message: "Course not found" });
  }

  res.json(course);
});

module.exports = router;
