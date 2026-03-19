const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CommunityMessage = sequelize.define(
  "CommunityMessage",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    communityId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    message: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "community_messages",
    timestamps: true,
  }
);

module.exports = CommunityMessage;