const {DataTypes} = require("sequelize");
const {sequelize} = require("../config/db");

const Product = sequelize.define("Product",{
     id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },

  businessId: {
    type: DataTypes.UUID,
    allowNull: false,
  },

  type: {
    type: DataTypes.ENUM("course", "event", "session", "digital", "package", "membership"),
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "draft", // draft | published
  },

  /* ================= MEMBERSHIP ACCESS ================= */

  membershipRequired: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  membershipPlanIds: {
  type: DataTypes.JSON
},
}, {
  tableName: "products",
  timestamps: true,
});

module.exports = Product;