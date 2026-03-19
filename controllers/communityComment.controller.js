const {
  CommunityPost,
  CommunityPostComment,
  CommunityMember,
} = require("../models");


/* ================= ADD COMMENT ================= */

exports.addComment = async (req, res) => {

  try {

    const { postId } = req.params;
    const { comment, parentId } = req.body;

    const post = await CommunityPost.findByPk(postId);

    if (!post) {
      return res.status(404).json({
        message: "Post not found",
      });
    }

    const member = await CommunityMember.findOne({
      where: {
        communityId: post.communityId,
        userId: req.user.id,
      },
    });

    if (!member) {
      return res.status(403).json({
        message: "Not a community member",
      });
    }

    const newComment = await CommunityPostComment.create({
      postId,
      userId: req.user.id,
      comment,
      parentId: parentId || null
    });

    res.json(newComment);

  } catch (err) {

    console.error("ADD COMMENT ERROR:", err);

    res.status(500).json({
      message: "Failed to add comment",
    });

  }

};


/* ================= DELETE COMMENT ================= */

exports.deleteComment = async (req, res) => {

  try {

    const comment = await CommunityPostComment.findByPk(
      req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({
        message: "Comment not found",
      });
    }

    if (comment.userId !== req.user.id) {
      return res.status(403).json({
        message: "Not allowed",
      });
    }

    await comment.destroy();

    res.json({
      message: "Comment deleted",
    });

  } catch (err) {

    console.error("DELETE COMMENT ERROR:", err);

    res.status(500).json({
      message: "Failed to delete comment",
    });

  }

};