const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Content = sequelize.define("Content", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  chapterId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM(
      "video",
      "image",
      "pdf",
      "text"
    ),
    allowNull: false,
  },

  allowBookmark: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  duration: DataTypes.INTEGER,
  pages: DataTypes.INTEGER,

  data: {
    type: DataTypes.JSON,
    allowNull: false,
  },

  order: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
});

module.exports = Content;
