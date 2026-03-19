const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const CommunityMember = sequelize.define(
  "CommunityMember",
  {

    id:{
      type:DataTypes.UUID,
      defaultValue:DataTypes.UUIDV4,
      primaryKey:true
    },

    communityId:{
      type:DataTypes.UUID,
      allowNull:false
    },

    userId:{
      type:DataTypes.UUID,
      allowNull:false
    },

    role:{
      type:DataTypes.ENUM("admin","member"),
      defaultValue:"member"
    },

    membershipId:{
      type:DataTypes.UUID,
      allowNull:true
    }

  },
  {
    tableName:"community_members",
    timestamps:true
  }
);

module.exports = CommunityMember;