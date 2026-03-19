const {
  Community,
  CommunityMember,
  CommunityPost,
  CommunityPostLike,
  CommunityPostComment,
  CommunityMessage,
} = require("../models");

const User = require("../models/User.model");

class CommunityService {

  /* ======================================
     GET COMMUNITY BY BUSINESS
  ====================================== */

  static async getCommunityByBusiness(businessId) {

    return await Community.findOne({
      where: { businessId },
    });

  }

  /* ======================================
     ADD MEMBER
  ====================================== */

  static async addMember(communityId, userId, role = "member") {

    const exists = await CommunityMember.findOne({
      where: { communityId, userId },
    });

    if (exists) return exists;

    return await CommunityMember.create({
      communityId,
      userId,
      role,
    });

  }

  /* ======================================
     GET MEMBERS
  ====================================== */

  static async getMembers(communityId) {

    return await CommunityMember.findAll({
      where: { communityId },
      include: [
        {
          model: User,
          attributes: ["id", "name", "email"],
        },
      ],
    });

  }

  /* ======================================
     GET FEED
  ====================================== */

  static async getFeed(communityId) {

    return await CommunityPost.findAll({
      where: {
        communityId,
        status: "approved",
      },
      include: [
        {
          model: CommunityPostLike,
        },
        {
          model: CommunityPostComment,
        },
      ],
      order: [["createdAt", "DESC"]],
    });

  }

  /* ======================================
     LIKE POST
  ====================================== */

  static async toggleLike(postId, userId) {

    const existing = await CommunityPostLike.findOne({
      where: { postId, userId },
    });

    if (existing) {
      await existing.destroy();
      return { liked: false };
    }

    await CommunityPostLike.create({
      postId,
      userId,
    });

    return { liked: true };

  }

  /* ======================================
     GET MESSAGES
  ====================================== */

  static async getMessages(communityId) {

    return await CommunityMessage.findAll({
      where: { communityId },
      include: [
        {
          model: User,
          attributes: ["id", "name"],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

  }

}

module.exports = CommunityService;