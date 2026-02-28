const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const PackageCourse = sequelize.define(
  "PackageCourse",
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },

    packageId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    courseId: {
      type: DataTypes.UUID,
      allowNull: false,
    },

    order: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "package_courses",
    timestamps: true,
  }
);

module.exports = PackageCourse;