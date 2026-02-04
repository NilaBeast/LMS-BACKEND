const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Chapter = sequelize.define(
  "Chapter",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
      index: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "chapters",
    timestamps: true,
  }
);

module.exports = Chapter;
