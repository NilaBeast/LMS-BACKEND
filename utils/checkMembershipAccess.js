const { MembershipPurchase } = require("../models");
const { Op } = require("sequelize");

module.exports = async function checkMembershipAccess(product, user) {

  if (!product) return true;

  if (product.status && product.status !== "published") {
    return false;
  }

  if (!product.membershipRequired) {
    return true;
  }

  if (!user) {
    return false;
  }

  let requiredPlans = product.membershipPlanIds || [];

  if (typeof requiredPlans === "string") {
    requiredPlans = JSON.parse(requiredPlans);
  }

  if (!requiredPlans.length) return true;

  const purchase = await MembershipPurchase.findOne({
    where: {
      userId: user.id,
      pricingId: {
        [Op.in]: requiredPlans,
      },
      status: "approved",
    },
  });

  return !!purchase;
};