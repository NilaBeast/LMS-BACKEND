const { CommunityMember, Community, Business } = require("../models");

exports.updateMemberCount = async (communityId) => {
  try {
    const totalMembers = await CommunityMember.count({
      where: { communityId }
    });

    const community = await Community.findByPk(communityId);
    if (!community) return;

    const business = await Business.findByPk(community.businessId);
    if (!business) return;

    const usage = business.planUsage || {
      members: 0,
      storageUsed: 0,
      aiMessagesToday: 0,
      aiLastReset: null
    };

    // IMPORTANT: Create new object (not mutate existing)
    const newUsage = {
      ...usage,
      members: totalMembers
    };

    await business.update({
      planUsage: newUsage
    });

    console.log("✅ Members updated to:", totalMembers);

  } catch (err) {
    console.error("updateMemberCount error:", err);
  }
};