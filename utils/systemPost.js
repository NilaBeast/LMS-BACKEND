const { CommunityPost } = require("../models");

exports.createSystemPost = async ({
  communityId,
  userId = null,
  content,
  gifUrl,
  visibility = "admin"
}) => {

  try {

    await CommunityPost.create({

      communityId,

      userId: userId || null, // can be null

      content,

      mediaUrl: gifUrl || null,
      mediaType: gifUrl ? "image" : null,

      status: "approved",

      isSystem: true,
      visibility

    });

  } catch (err) {
    console.error("SYSTEM POST ERROR:", err.message);
  }

};