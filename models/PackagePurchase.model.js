const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PackagePurchase = sequelize.define("PackagePurchase", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  userId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  packageId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

}, {
  tableName: "package_purchases",
  timestamps: true,
});

module.exports = PackagePurchase;