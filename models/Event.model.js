const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Event = sequelize.define(
  "Event",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    /* ================= PRODUCT ================= */

    productId: {
      type: DataTypes.UUID,
      allowNull: false,
      unique: true,
    },

    /* ================= BASIC ================= */

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },

    description: DataTypes.TEXT,

    coverMedia: DataTypes.STRING,

    coverType: {
      type: DataTypes.ENUM("image", "video"),
      allowNull: true,
    },

    /* ================= SCHEDULE ================= */

    startAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    endAt: {
      type: DataTypes.DATE,
      allowNull: true,
    },

    /* ✅ SESSION SYSTEM */

    sessionType: {
      type: DataTypes.ENUM(
        "one_time",
        "selected_dates",
        "weekly_repeat"
      ),
      defaultValue: "one_time",
    },

    sessionConfig: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    /* ================= MODE ================= */

    mode: {
      type: DataTypes.ENUM("online", "in_person"),
      allowNull: false,
    },

    meetingLink: DataTypes.STRING,

    locationAddress: DataTypes.STRING,

    /* ================= PRICING ================= */

    pricingType: {
      type: DataTypes.ENUM("free", "fixed", "flexible"),
      defaultValue: "free",
    },

    pricing: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    pricingBreakdown: {
      type: DataTypes.JSON,
      allowNull: true,
    },

    /* ================= REGISTRATION ================= */

    registrationClosed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    maxRegistrations: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },

    landingPageUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },

    requireApproval: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },

    hideAttendeeList: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

/* ================= CAPACITY ================= */

capacityEnabled: {
  type: DataTypes.BOOLEAN,
  defaultValue: false,
},

capacity: {
  type: DataTypes.INTEGER,
  allowNull: true,
},



    /* ================= HOST ================= */

    hostId: {
      type: DataTypes.UUID,
      allowNull: false, // ✅ NOT NULL
      references: {
        model: "users",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT", // ✅ Prevent deleting host
    },

    /* ================= COMMUNITY ================= */

    whatsappGroupUrl: {
      type: DataTypes.STRING,
      allowNull: true,
    },
  },
  {
    tableName: "events",
    timestamps: true,
  }
);

module.exports = Event;
