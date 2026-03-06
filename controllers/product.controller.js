const Product = require("../models/Product.model");
const Business = require("../models/Business.model");
const Course = require("../models/Course.model");
const User = require("../models/User.model");
const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");


/**
 * GET ALL PRODUCTS OF MY BUSINESS (ADMIN ONLY)
 */
exports.getMyProducts = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const products = await Product.findAll({
      where: { businessId: business.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(products);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch products" });
  }
};

/**
 * GET SINGLE PRODUCT (ADMIN ONLY)
 */
exports.getProductById = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({ message: "Business not found" });
    }

    const product = await Product.findOne({
      where: {
        id: req.params.id,
        businessId: business.id,
      },
    });

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);
  } catch (err) {
    console.error("GET PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to fetch product" });
  }
};

/**
 * UPDATE PRODUCT STATUS (ADMIN ONLY)
 */
exports.updateProductStatus = async (req, res) => {
  try {

    const {
      status,
      membershipRequired,
      membershipIds
    } = req.body;

    /* ================= VALIDATE STATUS ================= */

    if (status && !["draft", "published"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    /* ================= VERIFY BUSINESS ================= */

    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    /* ================= FIND PRODUCT ================= */

    const product = await Product.findOne({
      where: {
        id: req.params.id,
        businessId: business.id,
      },
    });

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    /* ================= UPDATE STATUS ================= */

    if (status) {
      product.status = status;
    }

    /* ================= MEMBERSHIP LOCK ================= */

    if (membershipRequired !== undefined) {

      const required =
        membershipRequired === true ||
        membershipRequired === "true";

      product.membershipRequired =
  req.body.membershipRequired == 1 ||
  req.body.membershipRequired === "1" ||
  req.body.membershipRequired === true;
      if (required) {

        product.membershipIds =
          typeof membershipIds === "string"
            ? JSON.parse(membershipIds)
            : membershipIds;

      } else {

        product.membershipIds = null;

      }

    }

    await product.save();

    /* ======================================================
       SEND EMAIL IF COURSE IS PUBLISHED
    ====================================================== */

    if (product.status === "published" && product.type === "course") {

      const course = await Course.findOne({
        where: { productId: product.id },
      });

      if (course) {

        const students = await User.findAll({
          where: { role: "user" },
        });

        for (const student of students) {

          const html = emailLayout(
            "New Course Available",
            `
            <h2>📢 New Course Launched!</h2>

            <p>Hello <strong>${student.name || "Student"}</strong>,</p>

            <p>
              A brand new course is now available on TechZuno.
            </p>

            <div style="
              background:#f1f5f9;
              padding:15px;
              border-radius:6px;
              margin:20px 0;
            ">
              <p><strong>Course:</strong> ${course.name}</p>
              <p><strong>Instructor:</strong> ${req.user.name}</p>
              <p><strong>Published On:</strong> ${new Date().toDateString()}</p>
            </div>

            <p>
              Start learning today and boost your skills 🚀
            </p>

            <div style="text-align:center;margin:25px 0;">
              <a href="${process.env.FRONTEND_URL}/courses"
                 style="
                   background:#22c55e;
                   color:#fff;
                   padding:12px 22px;
                   text-decoration:none;
                   border-radius:5px;
                   font-weight:600;
                 ">
                View Course
              </a>
            </div>

            <p>Happy Learning!</p>
            <p>— Team TechZuno</p>
            `
          );

          mailer.sendMail(
            student.email,
            "📢 New Course Available on TechZuno",
            html
          );

        }

      }

    }

    /* ================= RESPONSE ================= */

    return res.json({
      message: "Product updated successfully",
      product,
    });

  } catch (err) {

    console.error("UPDATE PRODUCT ERROR:", err);

    return res.status(500).json({
      message: "Failed to update product",
    });

  }
};
