const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CommunityPostLike = sequelize.define(
  "CommunityPostLike",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    postId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "community_post_likes",
    timestamps: true,
  }
);

module.exports = CommunityPostLike;