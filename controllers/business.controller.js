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
      description,
      slug,
      currency = "INR",
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      threads,
      customLinks
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

    /* CREATE BUSINESS */

    const business = await Business.create({
      userId: req.user.id,
      name,
      description,
      slug,
      currency,
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      threads,
      customLinks: customLinks ? JSON.parse(customLinks) : [],
      logo: req.files?.logo ? req.files.logo[0].path : null,
      banner: req.files?.banner ? req.files.banner[0].path : null,
    });

    /* CREATE COMMUNITY */

    const community = await Community.create({
      businessId: business.id
    });

    /* OWNER ADMIN */

    await CommunityMember.create({
      communityId: community.id,
      userId: req.user.id,
      role: "admin"
    });

    /* SYSTEM POST */

    await createSystemPost({
      communityId: community.id,
      userId: req.user.id,
      content: `🚀 Welcome !

Your community "${business.name}" is now live 🎉

Start posting, engaging and growing 🔥`,
      gifUrl: "https://media.giphy.com/media/OkJat1YNdoD3W/giphy.gif",
      visibility: "admin"
    });

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

exports.getUserBusinesses = async (req, res) => {
  try {

    const userId = req.user.id;

    /* OWNER BUSINESSES */
    const ownerBusinesses = await Business.findAll({
      where: { userId }
    });

    /* MEMBER BUSINESSES */
    const memberCommunities = await CommunityMember.findAll({
      where: { userId },
      include: {
        model: Community,
        include: {
          model: Business
        }
      }
    });

    const memberBusinesses = memberCommunities.map(
      (m) => m.Community.Business
    );

    /* MERGE */
    const allBusinesses = [
      ...ownerBusinesses,
      ...memberBusinesses
    ];

    res.json(allBusinesses);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to fetch businesses"
    });
  }
};

/**
 * UPDATE BUSINESS
 * PUT /api/business/:id
 */
exports.updateBusiness = async (req, res) => {
  try {
    const businessId = req.params.id;

    const {
      name,
      currency,
      description,
      slug,
      facebook,
      instagram,
      twitter,
      linkedin,
      youtube,
      threads,
      customLinks
    } = req.body;

    if (currency && !ALLOWED_CURRENCIES.includes(currency)) {
      return res.status(400).json({
        message: "Invalid currency"
      });
    }

    const business = await Business.findOne({
      where: {
        id: businessId,
        userId: req.user.id
      }
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found"
      });
    }

    let parsedLinks = business.customLinks;

try {
  if (customLinks) {
    parsedLinks = JSON.parse(customLinks);
  }
} catch (e) {
  parsedLinks = [];
}

await business.update({
  name,
  currency,
  description,
  slug,
  facebook,
  instagram,
  twitter,
  linkedin,
  youtube,
  threads,
  customLinks: parsedLinks,
  logo: req.files?.logo
    ? req.files.logo[0].path
    : business.logo,
  banner: req.files?.banner
    ? req.files.banner[0].path
    : business.banner,
});

    res.json(business);

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Failed to update business"
    });
  }
};