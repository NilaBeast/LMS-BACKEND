const {
  CommunityMessage,
  Community,
  CommunityMember,
  User,
} = require("../models");


/* ================= SEND MESSAGE ================= */

exports.sendMessage = async (req, res) => {

  try {

    const { communityId } = req.params;

    const community = await Community.findByPk(communityId);

    if (!community) {
      return res.status(404).json({
        message: "Community not found"
      });
    }

    const member = await CommunityMember.findOne({
      where:{
        communityId,
        userId: req.user.id
      }
    });

    if (!member) {
      return res.status(403).json({
        message: "You are not a community member"
      });
    }

    /* ================= PERMISSION ================= */

    if(
      member.role !== "admin" &&
      community.allowMemberMessages === false
    ){
      return res.status(403).json({
        message:"Members cannot send messages"
      });
    }

    /* ================= CREATE MESSAGE ================= */

    const message = await CommunityMessage.create({

      communityId,
      userId: req.user.id,
      message: req.body.message

    });

    res.json(message);

  } catch (err) {

    console.error("SEND MESSAGE ERROR:", err);

    res.status(500).json({
      message:"Failed to send message"
    });

  }

};


/* ================= GET MESSAGES ================= */

exports.getMessages = async (req, res) => {

  try {

    const { communityId } = req.params;

    const messages = await CommunityMessage.findAll({

      where: { communityId },

      include: [
        {
          model: User,
          attributes: ["id", "email", "name"]
        }
      ],

      order: [["createdAt", "DESC"]]

    });

    res.json(messages);

  } catch (err) {

    console.error("GET MESSAGES ERROR:", err);

    res.status(500).json({
      message: "Failed to fetch messages",
    });

  }

};