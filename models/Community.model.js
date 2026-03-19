const { DataTypes } = require("sequelize");
const { sequelize } = require("../config/db");

const Community = sequelize.define("Community", {

  id:{
    type:DataTypes.UUID,
    defaultValue:DataTypes.UUIDV4,
    primaryKey:true
  },

  businessId:{
    type:DataTypes.UUID,
    allowNull:false
  },

  enableMemberPosts:{
    type:DataTypes.BOOLEAN,
    defaultValue:true
  },

  requirePostApproval:{
    type:DataTypes.BOOLEAN,
    defaultValue:false
  },

  allowMemberMessages:{
    type:DataTypes.BOOLEAN,
    defaultValue:true
  }

},{
  tableName:"communities",
  timestamps:true
});

module.exports = Community;