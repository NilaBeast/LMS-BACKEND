const { Community, Business } = require("../models");

exports.getCommunity = async (req, res) => {
  try {

    const { businessId } = req.params;

    const community = await Community.findOne({
      where: { businessId }
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found"
      });
    }

    /* GET BUSINESS */

    const business = await Business.findByPk(businessId);

    /* CHECK OWNER */

    const isOwner =
      business?.userId === req.user.id;

    res.json({
      ...community.toJSON(),
      isOwner
    });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch community"
    });

  }
};

/* ================= UPDATE SETTINGS ================= */

exports.updateSettings = async (req, res) => {
  try {

    const { communityId } = req.params;

    const community = await Community.findByPk(communityId);

    if (!community) {
      return res.status(404).json({
        message: "Community not found",
      });
    }

    await community.update(req.body);

    res.json({
      message: "Settings updated",
      community,
    });

  } catch (err) {

    console.error("UPDATE COMMUNITY ERROR:", err);

    res.status(500).json({
      message: "Update failed",
    });

  }
};