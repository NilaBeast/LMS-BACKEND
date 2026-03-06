const {
  Membership,
  MembershipPricing,
  MembershipPurchase,
  MembershipAnswer,
  MembershipQuestion,
  User,
  Product,
} = require("../models");

const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");


/* =========================================
   PURCHASE MEMBERSHIP
========================================= */
exports.purchaseMembership = async (req, res) => {
  try {
    const { membershipId, pricingId, answers } = req.body;

    const membership = await Membership.findByPk(membershipId);

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const pricing = await MembershipPricing.findByPk(pricingId);

    if (!pricing) {
      return res.status(404).json({ message: "Pricing not found" });
    }

    const purchase = await MembershipPurchase.create({
      userId: req.user.id,
      membershipId,
      pricingId,
      status: membership.requireApproval ? "pending" : "approved",
    });

    /* Save answers */
    if (answers?.length) {
      for (const ans of answers) {
        await MembershipAnswer.create({
          purchaseId: purchase.id,
          questionId: ans.questionId,
          answer: ans.answer,
        });
      }
    }

    /* SEND EMAIL */
    const html = emailLayout(
      "Membership Confirmation",
      `
      <h2>Membership Purchase Confirmation</h2>
      <p>Hi ${req.user.name},</p>
      <p>You purchased <strong>${membership.title} Membership</strong>.</p>
      <p>Status: <strong>${purchase.status.toUpperCase()}</strong></p>
      `
    );

    mailer.sendMail(
      req.user.email,
      "Membership Purchase Confirmation",
      html
    );

    res.json({ message: "Purchased successfully", purchase });

  } catch (err) {
    console.error("PURCHASE ERROR:", err);
    res.status(500).json({ message: "Purchase failed" });
  }
};

/*===============MEMBERSHIP PURCHASES=============*/
exports.getMembershipPurchases = async (req, res) => {
  try {
    const purchases = await MembershipPurchase.findAll({
      where: { membershipId: req.params.id },
      include: [
        {
          model: User,
          attributes: ["id", "email", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(purchases);
  } catch (err) {
    console.error("GET PURCHASES ERROR:", err);
    res.status(500).json({ message: "Failed to load purchases" });
  }
};

/* =========================================
   APPROVE PURCHASE
========================================= */
exports.approvePurchase = async (req, res) => {
  try {
    const purchase = await MembershipPurchase.findByPk(req.params.id, {
      include: [User, Membership],
    });

    purchase.status = "approved";
    await purchase.save();

    const html = emailLayout(
      "Membership Approved",
      `
      <h2>🎉 Your Membership is Approved!</h2>
      <p>Membership: ${purchase.Membership.title}</p>
      `
    );

    mailer.sendMail(
      purchase.User.email,
      "Membership Approved",
      html
    );

    res.json({ message: "Approved" });

  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};


/* =========================================
   REJECT PURCHASE
========================================= */
exports.rejectPurchase = async (req, res) => {
  try {
    const purchase = await MembershipPurchase.findByPk(req.params.id, {
      include: [User, Membership],
    });

    purchase.status = "rejected";
    await purchase.save();

    const html = emailLayout(
      "Membership Rejected",
      `
      <h2>Membership Request Rejected</h2>
      <p>Membership: ${purchase.Membership.title}</p>
      `
    );

    mailer.sendMail(
      purchase.User.email,
      "Membership Rejected",
      html
    );

    res.json({ message: "Rejected" });

  } catch (err) {
    console.error("REJECT ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};

/* =========================================
   GET MY ACTIVE MEMBERSHIP
========================================= */
exports.getMyActiveMembership = async (req, res) => {
  try {

    const purchase = await MembershipPurchase.findOne({
      where: {
        userId: req.user.id,
        status: "approved",
      },
      include: [
        {
          model: Membership,
          include: [
            {
              model: Product,
              attributes: ["businessId"],
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    if (!purchase) {
      return res.json(null);
    }

    res.json({
      membershipId: purchase.membershipId,
      pricingId: purchase.pricingId,
      businessId: purchase.Membership.Product.businessId,
      status: purchase.status,
    });

  } catch (err) {

    console.error("ACTIVE MEMBERSHIP ERROR:", err);

    res.status(500).json({ message: "Failed" });

  }
};