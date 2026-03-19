const { Op } = require("sequelize");

const {
  CommunityPost,
  CommunityMember,
  Community,
  CommunityPostLike,
  CommunityPostComment,
  User
} = require("../models");

const mailer = require("../services/mail.service");
const { emailLayout } = require("../utils/emailTemplate");


/* =====================================================
   CREATE POST
===================================================== */

exports.createPost = async (req, res) => {

  try {

    const { communityId } = req.params;

    /* ===== FIND COMMUNITY (ID OR BUSINESS ID) ===== */

    const community = await Community.findOne({
      where: {
        [Op.or]: [
          { id: communityId },
          { businessId: communityId }
        ]
      }
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found"
      });
    }

    /* ===== CHECK MEMBERSHIP ===== */

    const member = await CommunityMember.findOne({
      where: {
        communityId: community.id,
        userId: req.user.id
      }
    });

    if (!member) {
      return res.status(403).json({
        message: "You are not a member of this community"
      });
    }

    /* ===== PERMISSION CHECK ===== */

    if (
      community.enableMemberPosts === false &&
      member.role !== "admin"
    ) {
      return res.status(403).json({
        message: "Member posts disabled"
      });
    }

    /* ===== POST STATUS ===== */

    let status =
      community.requirePostApproval && member.role !== "admin"
        ? "pending"
        : "approved";

    /* ===== MEDIA HANDLING ===== */

    let mediaUrl = null;
    let mediaType = null;

    if (req.file) {

      mediaUrl = req.file.path;

      mediaType = req.file.mimetype.startsWith("video")
        ? "video"
        : "image";

    }

    /* ===== CREATE POST ===== */

    const post = await CommunityPost.create({

      communityId: community.id,

      userId: req.user.id,

      content: req.body?.content || null,

      mediaUrl,

      mediaType,

      visibility: req.body?.visibility || "public",

      notifyMembers:
  member.role === "admin" && req.body?.notifyMembers === "true",
      membershipIds: req.body?.membershipIds || null,

      status

    });

    /* =====================================================
       🔥 NOTIFY MEMBERS (NEW FEATURE)
    ===================================================== */

    if (
      req.body.notifyMembers === "true" &&
      member.role === "admin"
    ) {

      try {

        const members = await CommunityMember.findAll({
          where: { communityId: community.id },
          include: [
            {
              model: User,
              attributes: ["email", "name"]
            }
          ]
        });

        const subject = "📢 New Community Post";

        const content = `
          <h2>Hello 👋</h2>

          <p><strong>${req.user.name}</strong> has posted a new update in your community.</p>

          <div style="background:#f1f5f9;padding:15px;border-radius:8px;margin:15px 0;">
            ${req.body.content || "New content shared"}
          </div>

          
        `;

        const html = emailLayout(subject, content);

        for (const m of members) {

          // skip sender
          if (m.userId === req.user.id) continue;

          if (!m.User?.email) continue;

          await mailer.sendMail(
            m.User.email,
            subject,
            html
          );

        }

        console.log("✅ Community notification emails sent");

      } catch (mailErr) {

        console.error("❌ EMAIL SEND ERROR:", mailErr.message);

      }

    }

    /* ===== RESPONSE ===== */

    res.json(post);

  } catch (err) {

    console.error("CREATE POST ERROR:", err);

    res.status(500).json({
      message: "Post failed"
    });

  }

};

/* ================= EDIT POST ================= */


exports.editPost = async (req, res) => {

  try {

    const { postId } = req.params;

    const post = await CommunityPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const member = await CommunityMember.findOne({
      where: {
        communityId: post.communityId,
        userId: req.user.id
      }
    });

    if (!member) {
      return res.status(403).json({
        message: "Not a member"
      });
    }

    if (post.userId !== req.user.id && member.role !== "admin") {
      return res.status(403).json({
        message: "Not allowed"
      });
    }

    /* ================= UPDATE TEXT ================= */

    if (req.body.content !== undefined) {
      post.content = req.body.content;
    }

    /* ================= MEDIA HANDLING ================= */

    if (req.file) {

      // replace media
      post.mediaUrl = req.file.path;

      if (req.file.mimetype.startsWith("video")) {
        post.mediaType = "video";
      } else {
        post.mediaType = "image";
      }

    }

    // remove media
    if (req.body.removeMedia === "true") {
      post.mediaUrl = null;
      post.mediaType = null;
    }

    /* ================= APPROVAL LOGIC ================= */

    if (member.role !== "admin") {
      post.status = "pending";
    }

    await post.save();

    res.json({
      message: "Post updated",
      post
    });

  } catch (err) {

    console.error("EDIT POST ERROR:", err);

    res.status(500).json({
      message: "Edit failed"
    });

  }

};

/* ================= APPROVE POST ================= */

exports.approvePost = async (req, res) => {

  try {

    const { postId } = req.params;

    const post = await CommunityPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found"
      });
    }

    const member = await CommunityMember.findOne({
      where: {
        communityId: post.communityId,
        userId: req.user.id
      }
    });

    if (!member || member.role !== "admin") {
      return res.status(403).json({
        message: "Admin access required"
      });
    }

    post.status = "approved";

    await post.save();

    res.json({
      message: "Post approved"
    });

  } catch (err) {

    console.error("APPROVE POST ERROR:", err);

    res.status(500).json({
      message: "Approval failed"
    });

  }

};

/* =====================================================
   GET COMMUNITY FEED
===================================================== */

exports.getFeed = async (req, res) => {

  try {

    const { communityId } = req.params;

    /* ================= FIND COMMUNITY ================= */

    const community = await Community.findOne({
      where: {
        [Op.or]: [
          { id: communityId },
          { businessId: communityId }
        ]
      }
    });

    if (!community) {
      return res.status(404).json({
        message: "Community not found"
      });
    }

    /* ================= CHECK MEMBER ================= */

    const member = await CommunityMember.findOne({
      where: {
        communityId: community.id,
        userId: req.user.id
      }
    });

    if (!member) {
      return res.status(403).json({
        message: "Not a member"
      });
    }

    /* ================= FEED FILTER ================= */

    let whereCondition = {
  communityId: community.id,
  status: "approved"
};

/* ================= MEMBER ================= */

if (member.role !== "admin") {

  whereCondition.visibility = {
    [Op.or]: ["public", null] // public only
  };

}

/* ================= ADMIN ================= */

if (member.role === "admin") {

  whereCondition = {
    communityId: community.id
    // admin sees everything
  };

}
    /* ================= FETCH POSTS ================= */

    const posts = await CommunityPost.findAll({

      where: whereCondition,

      include: [

        {
          model: User,
          attributes: ["id", "name", "email"] // ✅ UPDATED
        },

        {
          model: CommunityPostLike,
          attributes: ["id"]
        },

        {
          model: CommunityPostComment,
          where: { parentId: null },
          required: false,
          include: [

            {
              model: User,
              attributes: ["id", "name", "email"] // ✅ UPDATED
            },

            {
              model: CommunityPostComment,
              as: "replies",
              required: false,
              include: [
                {
                  model: User,
                  attributes: ["id", "name", "email"] // ✅ UPDATED
                }
              ]
            }

          ]
        }

      ],

      order: [["createdAt", "DESC"]]

    });

    const result = posts.map(p => {

      const postJSON = p.toJSON();

      return {

        ...postJSON,

        likesCount: postJSON.CommunityPostLikes?.length || 0,
        commentsCount: postJSON.CommunityPostComments?.length || 0

      };

    });

    res.json(result);

  } catch (err) {

    console.error("GET FEED ERROR:", err);

    res.status(500).json({
      message: "Failed to load feed"
    });

  }

};


/* =====================================================
   TOGGLE LIKE
===================================================== */

exports.toggleLike = async (req, res) => {

  try {

    const { postId } = req.params;

    const existing = await CommunityPostLike.findOne({

      where: {
        postId,
        userId: req.user.id
      }

    });

    if (existing) {

      await existing.destroy();

      return res.json({ liked: false });

    }

    await CommunityPostLike.create({

      postId,
      userId: req.user.id

    });

    res.json({ liked: true });

  } catch (err) {

    console.error("LIKE ERROR:", err);

    res.status(500).json({
      message: "Failed"
    });

  }

};



/* =====================================================
   DELETE POST
===================================================== */

exports.deletePost = async (req, res) => {

  try {

    const { postId } = req.params;

    const post = await CommunityPost.findByPk(postId);

    if (!post) {

      return res.status(404).json({
        message: "Post not found"
      });

    }

    const member = await CommunityMember.findOne({

      where: {
        communityId: post.communityId,
        userId: req.user.id
      }

    });

    if (!member) {

      return res.status(403).json({
        message: "Not member"
      });

    }

    if (
      post.userId !== req.user.id &&
      member.role !== "admin"
    ) {

      return res.status(403).json({
        message: "Not allowed"
      });

    }

    await post.destroy();

    res.json({
      message: "Post deleted"
    });

  } catch (err) {

    console.error("DELETE POST ERROR:", err);

    res.status(500).json({
      message: "Delete failed"
    });

  }

};