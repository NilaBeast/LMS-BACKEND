// models/Content.model.js
const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Content = sequelize.define(
  "Content",
  {
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
        "quiz",
        "assignment",
        "form",
        "text"
      ),
      allowNull: false,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    /**
     * video / assignment:
     * { url, publicId, mime }
     *
     * quiz:
     * { questions: [] }
     *
     * form:
     * { fields: [] }
     *
     * text:
     * { html }
     */
    data: {
      type: DataTypes.JSON,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "contents",
    timestamps: true,
  }
);

module.exports = Content;
