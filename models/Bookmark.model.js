const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Bookmark = sequelize.define(
  "Bookmark",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    chapterId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    contentId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    progress: {
      type: DataTypes.FLOAT, // seconds
      defaultValue: 0,
    },
  },
  {
    tableName: "bookmarks",
    timestamps: true,
  }
);

module.exports = Bookmark;
