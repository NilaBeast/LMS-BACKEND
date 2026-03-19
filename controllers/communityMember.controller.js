const {
  CommunityMember,
  User
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

      where.membershipId = {
        [Op.ne]: null
      };

    }

    const members = await CommunityMember.findAll({

      where,

      include: [
        {
          model: User,
          attributes: ["id","name","email"]
        }
      ],

      order:[["createdAt","DESC"]]

    });

    res.json(members);

  } catch (err) {

    console.error(err);

    res.status(500).json({
      message: "Failed to fetch members"
    });

  }

};