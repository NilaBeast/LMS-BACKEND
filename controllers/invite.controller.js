const Business = require("../models/Business.model");
const Community = require("../models/Community.model");
const CommunityMember = require("../models/CommunityMember.model");

exports.joinBySlug = async (req, res) => {
  try {
    const { slug } = req.params;
    const userId = req.user.id;

    const business = await Business.findOne({
      where: { slug }
    });

    if (!business) {
      return res.status(404).json({
        message: "Business not found"
      });
    }

    const community = await Community.findOne({
      where: { businessId: business.id }
    });

    const existing = await CommunityMember.findOne({
      where: {
        communityId: community.id,
        userId: req.user.id
      }
    });

    if (existing) {
      return res.json({
        message: "Already joined",
        businessId: business.id
      });
    }

    await CommunityMember.create({
      communityId: community.id,
      userId,
      role: "member"
    });

    res.json({
      message: "Joined successfully",
      businessId: business.id
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Join failed"
    });
  }
};