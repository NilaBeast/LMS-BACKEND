const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DigitalFileContent = sequelize.define(
  "DigitalFileContent",
  {

    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    digitalFileId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    heading: DataTypes.STRING,

    fileUrl: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    fileType: DataTypes.STRING,

    /* ✅ NEW: Banner Image */
    banner: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    order: {
  type: DataTypes.INTEGER,
  defaultValue: 0,
},

    originalName: {
      type: DataTypes.STRING,
    },

    extension: {
      type: DataTypes.STRING,
    },

    /* (Optional: keep thumbnail if used elsewhere) */
    thumbnail: DataTypes.STRING,

  },
  {
    tableName: "digital_file_contents",
    timestamps: true,
  }
);

module.exports = DigitalFileContent;