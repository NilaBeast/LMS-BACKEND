const Business = require("../models/Business.model");

const ALLOWED_CURRENCIES = [
  "INR","USD","EUR","GBP","JPY","AUD","CAD","SGD",
  "AED","SAR","ZAR","CNY","HKD","NZD","CHF"
];

/**
 * CREATE / UPDATE BUSINESS
 */
exports.createBusiness = async (req, res) => {
  try {
    const {
      name,
      currency = "INR",
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      threads,
    } = req.body;

    if (!name) {
      return res.status(400).json({ message: "Business name required" });
    }

    const business = await Business.create({
      userId: req.user.id,
      name,
      currency,
      logo: req.file?.path || null,
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      threads,
    });

    res.status(201).json(business);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Business creation failed" });
  }
};


/**
 * GET MY BUSINESS
 */
exports.getMyBusinesses = async (req, res) => {
  try {
    const Business = require("../models/Business.model");

    const businesses = await Business.findAll({
      where: { userId: req.user.id },
      order: [["createdAt", "DESC"]],
    });

    res.json(businesses);
  } catch (err) {
    console.error("GET MY BUSINESSES ERROR:", err);
    res.status(500).json({ message: "Failed to fetch businesses" });
  }
};
