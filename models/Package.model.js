const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Package = sequelize.define("Package", {
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

  businessId: {
  type: DataTypes.UUID,
  allowNull: false,
},

  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  description: DataTypes.TEXT,

  banner: DataTypes.STRING,

  pricingType: {
    type: DataTypes.ENUM("fixed", "flexible"),
    allowNull: false,
  },

  pricing: DataTypes.JSON,

  pricingBreakdown: DataTypes.JSON,

  viewBreakdown: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },

}, {
  tableName: "packages",
  timestamps: true,
});

module.exports = Package;