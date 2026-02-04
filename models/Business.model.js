const {DataTypes} = require("sequelize");
const {sequelize} = require("../config/db");

const business = sequelize.define(
    "Business",
    {
        id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      
    },

    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    logo: {
      type: DataTypes.STRING, // Cloudinary URL
    },

    currency: {
      type: DataTypes.STRING,
      defaultValue: "INR",
    },

    facebook: DataTypes.STRING,
    instagram: DataTypes.STRING,
    twitter: DataTypes.STRING,
    linkedin: DataTypes.STRING,
    youtube: DataTypes.STRING,
    threads: DataTypes.STRING,
    customLinks: {
      type: DataTypes.JSON, // array of links
    },
  },
  {
    tableName: "businesses",
    timestamps: true,
  }
    
);

module.exports = business;