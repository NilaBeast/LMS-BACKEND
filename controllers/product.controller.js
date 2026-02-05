const Product = require("../models/Product.model");
const Business = require("../models/Business.model");
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
    const { status } = req.body;

    if (!["draft", "published"].includes(status)) {
      return res.status(400).json({
        message: "Invalid status",
      });
    }

    /* 🔒 Verify business */
    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    /* 🔍 Find product */
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

    /* ✅ Update status */
    product.status = status;
    await product.save();

    /* ============================
       📧 SEND MAIL ON PUBLISH
       ============================ */

    if (status === "published") {

      /* Get course */
      const course = await Course.findOne({
        where: { productId: product.id },
      });

      /* Get all students */
      const students = await User.findAll({
        where: { role: "user" },
      });

      /* Send mails (background-safe) */
      for (const student of students) {

        const html = emailLayout(
          "New Course Available",
          `
          <h2>📢 New Course Launched!</h2>

          <p>Hello <strong>${student.name || "Student"}</strong>,</p>

          <p>
            A brand new course is now available on TechZuno.
          </p>

          <div style="background:#f1f5f9;padding:15px;border-radius:6px;margin:20px 0;">
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

        // Don't block API if mail fails
        mailer.sendMail(
          student.email,
          "📢 New Course Available on TechZuno",
          html
        );
      }
    }

    /* ============================ */

    return res.json({
      message: "Product status updated",
      product,
    });

  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);

    return res.status(500).json({
      message: "Failed to update product",
    });
  }
};
