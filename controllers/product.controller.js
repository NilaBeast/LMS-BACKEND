const Product = require("../models/Product.model");
const Business = require("../models/Business.model");

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
      return res.status(400).json({ message: "Invalid status" });
    }

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

    product.status = status;
    await product.save();

    res.json({
      message: "Product status updated",
      product,
    });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Failed to update product" });
  }
};
