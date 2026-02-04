const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const User = sequelize.define(
  "User",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    firebaseUid: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },

    password: {
      type: DataTypes.STRING, // bcrypt hash
      allowNull: true,        // null for Google users
    },

    name: DataTypes.STRING,
    photo: DataTypes.STRING,

    provider: {
      type: DataTypes.ENUM("google", "password"),
      allowNull: false,
    },

    role: {
      type: DataTypes.STRING,
      defaultValue: "user",
    },
  },
  {
    tableName: "users",
    timestamps: true,
  }
);

module.exports = User;
