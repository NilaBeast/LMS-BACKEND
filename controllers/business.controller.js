const Business = require("../models/Business.model");
const Community = require("../models/Community.model");
const CommunityMember = require("../models/CommunityMember.model");
const { createSystemPost } = require("../utils/systemPost");

const ALLOWED_CURRENCIES = [
  "INR","USD","EUR","GBP","JPY","AUD","CAD","SGD",
  "AED","SAR","ZAR","CNY","HKD","NZD","CHF"
];

/**
 * CREATE BUSINESS
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
      threads
    } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Business name required"
      });
    }

    if (!ALLOWED_CURRENCIES.includes(currency)) {
      return res.status(400).json({
        message: "Invalid currency"
      });
    }

    /* ================= CREATE BUSINESS ================= */

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
      threads

    });

    /* ================= CREATE COMMUNITY ================= */

    const community = await Community.create({
      businessId: business.id
    });

    /* ================= OWNER IS ADMIN ================= */

    await CommunityMember.create({

      communityId: community.id,
      userId: req.user.id,
      role: "admin"

    });

    /* ================= 🔥 SYSTEM WELCOME POST ================= */

    await createSystemPost({

      communityId: community.id,

      userId: req.user.id, // optional (can be null)

      content: `🚀 Welcome !

Your community "${business.name}" is now live 🎉

Start posting, engaging and growing 🔥`,

      gifUrl: "https://media.giphy.com/media/OkJat1YNdoD3W/giphy.gif",
      visibility: "admin"

    });

    /* ================= RESPONSE ================= */

    res.status(201).json({
      business,
      community
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Business creation failed"
    });

  }

};


/**
 * GET MY BUSINESSES
 */

exports.getMyBusinesses = async (req, res) => {

  try {

    const businesses = await Business.findAll({

      where: { userId: req.user.id },

      order: [["createdAt", "DESC"]]

    });

    res.json(businesses);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch businesses"
    });

  }

};