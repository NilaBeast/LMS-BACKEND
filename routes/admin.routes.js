const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");
const upload = require("../middlewares/upload.middleware");

const businessCtrl = require("../controllers/business.controller");
const courseCtrl = require("../controllers/course.controller");
const productCtrl = require("../controllers/product.controller");

/* ================= BUSINESS ================= */
router.post(
  "/business",
  protect,
  isAdmin,
  upload.single("logo"),
  businessCtrl.createBusiness
);

/* ================= COURSES ================= */
router.post(
  "/courses",
  protect,
  isAdmin,
  upload.single("coverImage"),
  courseCtrl.createCourse
);

router.put(
  "/courses/:id",
  protect,
  isAdmin,
  upload.single("coverImage"),
  courseCtrl.updateCourse
);

router.delete(
  "/courses/product/:productId",
  protect,
  isAdmin,
  courseCtrl.deleteCourse
);

/* ================= PRODUCT STATUS ================= */
router.patch(
  "/products/:id/status",
  protect,
  isAdmin,
  productCtrl.updateProductStatus
);

module.exports = router;
