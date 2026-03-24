const {
  CommunityMember,
  User,
  Community,
  Business
} = require("../models");

const { Op } = require("sequelize");

exports.getMembers = async (req, res) => {
  try {
    const { communityId } = req.params;
    const { type } = req.query;

    let where = { communityId };

    if (type === "free") {
      where.membershipId = null;
    }

    if (type === "membership") {
      where.membershipId = { [Op.ne]: null };
    }

    // Get members
    const members = await CommunityMember.findAll({
      where,
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"]
        }
      ],
      order: [["createdAt", "DESC"]]
    });

    // Count members
    const totalMembers = await CommunityMember.count({
      where: { communityId }
    });

    // Update business plan usage
    const community = await Community.findByPk(communityId);

    if (community && community.businessId) {
      const business = await Business.findByPk(community.businessId);

      if (business) {
        const usage = business.planUsage || {};

        await business.update({
          planUsage: {
            members: totalMembers,
            storageUsed: usage.storageUsed || 0,
            aiMessagesToday: usage.aiMessagesToday || 0,
            aiLastReset: usage.aiLastReset || null
          }
        });
      }
    }

    res.json({
      members,
      totalMembers
    });

  } catch (err) {
    console.error("Get members error:", err);
    res.status(500).json({
      message: "Failed to fetch members"
    });
  }
};