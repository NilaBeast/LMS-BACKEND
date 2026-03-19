const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Comment = sequelize.define(
  "CommunityPostComment",
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

    parentId:{
  type:DataTypes.UUID,
  allowNull:true
},

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    comment: DataTypes.TEXT,
  },
  {
    tableName: "community_post_comments",
    timestamps: true,
  }
);

module.exports = Comment;