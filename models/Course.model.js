const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Course = sequelize.define("Course", {
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

  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: DataTypes.TEXT,

  coverImage: DataTypes.STRING,

  pricingType: {
    type: DataTypes.ENUM("fixed", "flexible", "installment"),
    allowNull: false,
  },

  pricing: DataTypes.JSON,

  pricingBreakdown: DataTypes.JSON,

  viewBreakdown: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

  hasRoom: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  /* ================= ACCESS CONTROL ================= */

  isLimited: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  accessType: {
    type: DataTypes.ENUM("fixed_date", "days"),
    allowNull: true,
  },

  expiryDate: {
    type: DataTypes.DATE,
    allowNull: true,
  },

  accessDays: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },

  /* ================================================ */

  courseSettings: {
    type: DataTypes.JSON,
    defaultValue: {
      enableBookmark: true,
      enableExpiry: true,
      enableRoom: true,
      enableMail: true,
      showDuration: true,
      showPages: true,
    },
  },

  roomConfig: DataTypes.JSON,
}, {
  tableName: "courses",
  timestamps: true,
});

module.exports = Course;
