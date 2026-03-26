const Business = require("../models/Business.model");
const Membership = require("../models/Membership.model");
const MembershipPricing = require("../models/MembershipPricing.model");

exports.getBusinessBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const business = await Business.findOne({
      where: { slug },
      include: {
        model: Membership,
        include: MembershipPricing
      }
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found"
      });
    }

    res.json(business);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to load business"
    });
  }
};