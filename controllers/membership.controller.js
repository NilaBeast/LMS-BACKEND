const {
  Membership,
  MembershipPricing,
  MembershipQuestion,
  MembershipQuestionOption,
  MembershipAnswer,
  MembershipPurchase,
  Product,
  Business,
} = require("../models");

const { sequelize } = require("../config/db");


/* =========================================
   CREATE MEMBERSHIP
========================================= */
exports.createMembership = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const {
      title,
      description,
      welcomeMessage,
      pricingOptions,
    } = req.body;

    const cover = req.file ? req.file.path : null;

    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      await transaction.rollback();
      return res.status(404).json({ message: "Business not found" });
    }

    const product = await Product.create(
      {
        businessId: business.id,
        type: "membership",
      },
      { transaction }
    );

    const membership = await Membership.create(
      {
        productId: product.id,
        title,
        description,
        cover,
        welcomeMessage,
      },
      { transaction }
    );

    /* ================= HANDLE PRICING ================= */

    if (pricingOptions) {
      const parsed =
        typeof pricingOptions === "string"
          ? JSON.parse(pricingOptions)
          : pricingOptions;

      for (const plan of parsed) {
        const price = Number(plan.price) || 0;

        const hasDiscount = !!plan.hasDiscount;

        const discountValue =
          hasDiscount && plan.discountValue !== ""
            ? Number(plan.discountValue) || 0
            : 0;

        await MembershipPricing.create(
          {
            membershipId: membership.id,
            interval: plan.interval,
            duration: Number(plan.duration) || 1,
            price,
            hasDiscount,
            discountType: plan.discountType || "percentage",
            discountValue,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    res.json({
      message: "Membership created successfully",
      membership,
    });

  } catch (err) {
    await transaction.rollback();
    console.error("CREATE MEMBERSHIP ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};



/* =========================================
   UPDATE MEMBERSHIP
========================================= */
exports.updateMembership = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const membership = await Membership.findByPk(req.params.id);

    if (!membership) {
      await transaction.rollback();
      return res.status(404).json({ message: "Not found" });
    }

    const {
      title,
      description,
      welcomeMessage,
      pricingOptions,
    } = req.body;

    if (req.file) {
      membership.cover = req.file.path;
    }

    await membership.update(
      {
        title,
        description,
        welcomeMessage,
      },
      { transaction }
    );

    /* ================= HANDLE PRICING ================= */

    if (pricingOptions) {
      const parsed =
        typeof pricingOptions === "string"
          ? JSON.parse(pricingOptions)
          : pricingOptions;

      /* 1️⃣ Delete old pricing */
      await MembershipPricing.destroy({
        where: { membershipId: membership.id },
        transaction,
      });

      /* 2️⃣ Recreate pricing safely */
      for (const plan of parsed) {
        const price = Number(plan.price) || 0;

        const hasDiscount = !!plan.hasDiscount;

        const discountValue =
          hasDiscount && plan.discountValue !== ""
            ? Number(plan.discountValue) || 0
            : 0;

        await MembershipPricing.create(
          {
            membershipId: membership.id,
            interval: plan.interval,
            duration: Number(plan.duration) || 1,
            price,
            hasDiscount,
            discountType: plan.discountType || "percentage",
            discountValue,
          },
          { transaction }
        );
      }
    }

    await transaction.commit();

    res.json({
      message: "Updated successfully",
      membership,
    });

  } catch (err) {
    await transaction.rollback();
    console.error("UPDATE MEMBERSHIP ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};

/*====================GET ALL MEMBERSHIPS=============*/
exports.getMyMemberships = async (req, res) => {
  try {
    // Step 1: Find business owned by user
    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    // Step 2: Get memberships under that business
    const memberships = await Membership.findAll({
      include: [
        {
          model: MembershipPricing,
        },
        {
          model: Product,
          where: {
            businessId: business.id,
            type: "membership",
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    res.json(memberships);
  } catch (err) {
    console.error("GET MEMBERSHIPS ERROR:", err);
    res.status(500).json({
      message: "Failed to load memberships",
    });
  }
};

/*===============GET SINGLE MEMBERSHIP=============*/
/* GET SINGLE */
exports.getMembershipById = async (req, res) => {
  try {
    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    const membership = await Membership.findOne({
      where: { id: req.params.id },
      include: [
        MembershipPricing,
        {
          model: MembershipQuestion,
          include: [MembershipQuestionOption],
        },
        {
          model: Product,
          where: { businessId: business.id },
        },
      ],
    });

    if (!membership) {
      return res.status(404).json({ message: "Not found" });
    }

    res.json(membership);

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to load membership" });
  }
};

/* =========================================
   DELETE MEMBERSHIP
========================================= */
exports.deleteMembership = async (req, res) => {
  const transaction = await sequelize.transaction();

  try {
    const membership = await Membership.findByPk(req.params.id);

    if (!membership) {
      await transaction.rollback();
      return res.status(404).json({ message: "Not found" });
    }

    const membershipId = membership.id;
    const productId = membership.productId;

    /* Delete membership answers */
    await MembershipAnswer.destroy({
      where: { purchaseId: sequelize.literal(
        `(SELECT id FROM membership_purchases WHERE membershipId='${membershipId}')`
      )},
      transaction,
    });

    /* Delete membership purchases */
    await MembershipPurchase.destroy({
      where: { membershipId },
      transaction,
    });

    /* Delete membership questions */
    await MembershipQuestion.destroy({
      where: { membershipId },
      transaction,
    });

    /* Delete pricing */
    await MembershipPricing.destroy({
      where: { membershipId },
      transaction,
    });

    /* Delete membership */
    await membership.destroy({ transaction });

    /* Delete product */
    await Product.destroy({
      where: { id: productId },
      transaction,
    });

    await transaction.commit();

    res.json({ message: "Membership deleted successfully" });

  } catch (err) {
    await transaction.rollback();
    console.error("DELETE MEMBERSHIP ERROR:", err);
    res.status(500).json({ message: "Delete failed" });
  }
};


/* =========================================
   ADD QUESTION
========================================= */
exports.addQuestion = async (req, res) => {
  try {
    const { question, type, options } = req.body;

    const membershipId = req.params.id;

    const newQuestion = await MembershipQuestion.create({
      membershipId,
      question,
      type,
    });

    if (["single", "multi"].includes(type) && options?.length) {
      for (const opt of options) {
        await MembershipQuestionOption.create({
          questionId: newQuestion.id,
          value: opt,
        });
      }
    }

    res.json({ message: "Question added" });

  } catch (err) {
    console.error("ADD QUESTION ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};


/* =========================================
   UPDATE QUESTION
========================================= */
exports.updateQuestion = async (req, res) => {
  try {
    const { question: text, type, options } = req.body;

    const questionObj = await MembershipQuestion.findByPk(req.params.id);

    if (!questionObj) {
      return res.status(404).json({ message: "Not found" });
    }

    await questionObj.update({
      question: text,
      type,
    });

    // Remove old options
    await MembershipQuestionOption.destroy({
      where: { questionId: questionObj.id },
    });

    // Add new options if needed
    if (["single", "multi"].includes(type) && options?.length) {
      for (const opt of options) {
        await MembershipQuestionOption.create({
          questionId: questionObj.id,
          value: opt,
        });
      }
    }

    res.json({ message: "Updated successfully" });

  } catch (err) {
    console.error("UPDATE QUESTION ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};


/* =========================================
   DELETE QUESTION
========================================= */
exports.deleteQuestion = async (req, res) => {
  try {
    const question = await MembershipQuestion.findByPk(req.params.id);

    if (!question) {
      return res.status(404).json({ message: "Not found" });
    }

    await question.destroy();

    res.json({ message: "Deleted" });

  } catch (err) {
    console.error("DELETE QUESTION ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};


/* =========================================
   TOGGLE REQUIRE APPROVAL
========================================= */
exports.toggleApproval = async (req, res) => {
  try {
    const membership = await Membership.findByPk(req.params.id);

    membership.requireApproval = !membership.requireApproval;

    await membership.save();

    res.json({ requireApproval: membership.requireApproval });

  } catch (err) {
    console.error("TOGGLE APPROVAL ERROR:", err);
    res.status(500).json({ message: "Failed" });
  }
};

exports.getMembershipOptions = async (req, res) => {
  try {

    const business = await Business.findOne({
      where: { userId: req.user.id },
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found",
      });
    }

    const memberships = await Membership.findAll({
      include: [
        {
          model: Product,
          where: {
            businessId: business.id,
            type: "membership",
            status: "published",
          },
          attributes: [],
        },
        {
          model: MembershipPricing,
          attributes: ["id",  "price"],
        },
      ],
      attributes: ["id", "title"],
      order: [["createdAt", "DESC"]],
    });

    res.json(memberships);

  } catch (err) {

    console.error("MEMBERSHIP OPTIONS ERROR:", err);

    res.status(500).json({
      message: "Failed to load memberships",
    });
  }
};