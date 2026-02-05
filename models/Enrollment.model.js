const {DataTypes} = require("sequelize");
const {sequelize} = require("../config/db");

const Enrollment = sequelize.define(
    "Enrollment",
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

    expiresAt: {
  type: DataTypes.DATE,
},


    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },
  },
  {
    tableName: "enrollments",
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ["userId", "courseId"],
      },
    ],
  }
);

module.exports = Enrollment;