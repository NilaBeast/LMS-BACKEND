const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const DigitalFile = sequelize.define(
  "DigitalFile",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: DataTypes.TEXT,

    banner: DataTypes.STRING, // image/video URL

    /* ================= PRICING ================= */

    pricingType: {
      type: DataTypes.ENUM(
        "fixed",
        "flexible",
        "installment"
      ),
      allowNull: false,
    },

    pricing: DataTypes.JSON,

    pricingBreakdown: DataTypes.JSON,

    viewBreakdown: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    /* ================= ACCESS CONTROL ================= */

    isLimited: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    accessType: {
      type: DataTypes.ENUM("days", "fixed_date"),
      allowNull: true,
    },

    accessDays: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    /* ================================================ */
  },
  {
    tableName: "digital_files",
    timestamps: true,
  }
);

module.exports = DigitalFile;