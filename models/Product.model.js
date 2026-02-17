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
    type: DataTypes.ENUM("course", "event"),
    allowNull: false,
  },

  status: {
    type: DataTypes.STRING,
    defaultValue: "draft", // draft | published
  },
}, {
  tableName: "products",
  timestamps: true,
});

module.exports = Product;