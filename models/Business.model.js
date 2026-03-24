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

    description: DataTypes.TEXT,
banner: DataTypes.STRING,
slug: DataTypes.STRING,
layout: {
  type: DataTypes.STRING,
  defaultValue: "stacked"
},

    currency: {
      type: DataTypes.STRING,
      defaultValue: "INR",
    },

    emailPreferences: {
  type: DataTypes.JSON,
  defaultValue: {
    newMember: true,
    memberLeave: true,
    dailySummary: true,
    newChallenge: true,
    newAffiliate: true,
    inventoryLow: true,
    outOfStock: true
  }
},

pixelSettings: {
  type: DataTypes.JSON,
  defaultValue: {
    metaPixelId: "",
    metaAccessToken: "",
    googleMeasurementId: "",
    googleAccessToken: ""
  }
},

planUsage: {
  type: DataTypes.JSON,
  defaultValue: {
    members: 0,
    storageUsed: 0,
    aiMessagesToday: 0,
    aiLastReset: null
  }
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