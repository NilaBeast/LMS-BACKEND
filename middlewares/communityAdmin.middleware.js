const { Community, CommunityMember } = require("../models");

module.exports = async function communityAdmin(req, res, next) {
  try {

    const communityId =
      req.params.communityId ||
      req.body.communityId ||
      req.query.communityId;

    if (!communityId) {
      return res.status(400).json({
        message: "Community ID required",
      });
    }

    const member = await CommunityMember.findOne({
      where: {
        communityId,
        userId: req.user.id,
        role: "admin",
      },
    });

    if (!member) {
      return res.status(403).json({
        message: "Admin access required",
      });
    }

    next();

  } catch (err) {

    console.error("COMMUNITY ADMIN MIDDLEWARE ERROR:", err);

    res.status(500).json({
      message: "Authorization failed",
    });

  }
};