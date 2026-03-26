const {
  Membership,
  MembershipPricing,
  MembershipPurchase,
  MembershipAnswer,
  MembershipQuestion,
  User,
  Product,
  Business,
  Community,
  CommunityMember
} = require("../models");

const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");
const { generateInvoice } = require("../utils/invoiceGenerator");
const fs = require("fs");


/* =========================================
   PURCHASE MEMBERSHIP (FREE + PAID + INVOICE)
========================================= */
exports.purchaseMembership = async (req, res) => {
  try {
    const { membershipId, pricingId, answers } = req.body;

    const membership = await Membership.findByPk(membershipId, {
      include: [
        {
          model: Product,
          include: [Business]
        }
      ]
    });

    if (!membership) {
      return res.status(404).json({ message: "Membership not found" });
    }

    const pricing = await MembershipPricing.findByPk(pricingId);

    if (!pricing) {
      return res.status(404).json({ message: "Pricing not found" });
    }

    /* CHECK IF ALREADY PURCHASED */
    const existing = await MembershipPurchase.findOne({
      where: {
        userId: req.user.id,
        membershipId
      }
    });

    if (existing) {
      return res.json({
        message: "Already purchased",
        purchase: existing
      });
    }

    /* DETERMINE STATUS */
    let status = "approved";

    if (membership.requireApproval) {
      status = "pending";
    }

    /* CREATE PURCHASE */
    const purchase = await MembershipPurchase.create({
      userId: req.user.id,
      membershipId,
      pricingId,
      status
    });

    /* SAVE ANSWERS */
    if (answers?.length) {
      for (const ans of answers) {
        await MembershipAnswer.create({
          purchaseId: purchase.id,
          questionId: ans.questionId,
          answer: ans.answer,
        });
      }
    }

    /* AUTO JOIN BUSINESS IF APPROVED */
    if (status === "approved") {
      const businessId = membership.Product.businessId;

      const community = await Community.findOne({
        where: { businessId }
      });

      if (community) {
        const existingMember = await CommunityMember.findOne({
          where: {
            communityId: community.id,
            userId: req.user.id
          }
        });

        if (!existingMember) {
          await CommunityMember.create({
            communityId: community.id,
            userId: req.user.id,
            role: "member"
          });
        }
      }
    }

    /* ================= GENERATE INVOICE ================= */

    let invoicePath = null;

    if (pricing.price > 0) {
      invoicePath = await generateInvoice({
        invoiceId: purchase.id,
        customerName: req.user.name,
        itemName: membership.title + " Membership",
        amount: pricing.price,
        business: membership.Product.Business
      });
    }

    /* ================= SEND EMAIL ================= */

    const html = emailLayout(
      "Membership Confirmation",
      `
      <h2>Membership Confirmation</h2>
      <p>Hi ${req.user.name},</p>
      <p>You joined <strong>${membership.title}</strong>.</p>
      <p>Status: <strong>${status.toUpperCase()}</strong></p>
      ${pricing.price > 0 ? "<p>Invoice attached.</p>" : ""}
      `
    );

    await mailer.sendMail(
      req.user.email,
      "Membership Confirmation",
      html,
      invoicePath
        ? [
            {
              filename: "invoice.pdf",
              path: invoicePath
            }
          ]
        : []
    );

    /* DELETE TEMP INVOICE */
    if (invoicePath && fs.existsSync(invoicePath)) {
      fs.unlinkSync(invoicePath);
    }

    res.json({
      message: "Membership processed successfully",
      purchase
    });

  } catch (err) {
    console.error("PURCHASE ERROR:", err);
    res.status(500).json({ message: "Purchase failed" });
  }
};


/* =========================================
   GET MEMBERSHIP PURCHASES (ADMIN)
========================================= */
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
      include: [
        User,
        {
          model: Membership,
          include: [
            {
              model: Product,
              attributes: ["businessId"]
            }
          ]
        }
      ],
    });

    purchase.status = "approved";
    await purchase.save();

    /* ADD USER TO COMMUNITY */
    const businessId = purchase.Membership.Product.businessId;

    const community = await Community.findOne({
      where: { businessId }
    });

    if (community) {
      const existingMember = await CommunityMember.findOne({
        where: {
          communityId: community.id,
          userId: purchase.userId
        }
      });

      if (!existingMember) {
        await CommunityMember.create({
          communityId: community.id,
          userId: purchase.userId,
          role: "member"
        });
      }
    }

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