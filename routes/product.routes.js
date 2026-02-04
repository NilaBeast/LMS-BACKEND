const express = require("express");
const router = express.Router();

const { protect } = require("../middlewares/auth.middleware");
const { isAdmin } = require("../middlewares/role.middleware");

const {
  getMyProducts,
  getProductById,
  updateProductStatus,
} = require("../controllers/product.controller");

// 🔐 ADMIN-ONLY ROUTES
router.get("/", protect, isAdmin, getMyProducts);
router.get("/:id", protect, isAdmin, getProductById);
router.patch("/:id/status", protect, isAdmin, updateProductStatus);

module.exports = router;
