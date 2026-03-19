const {DataTypes} = require("sequelize");
const {sequelize} = require("../config/db");

const CommunityPost = sequelize.define("CommunityPost",{

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

content:DataTypes.TEXT,

mediaUrl:DataTypes.STRING,

mediaType:{
type:DataTypes.ENUM("image","video")
},

visibility:{
type:DataTypes.ENUM("public","members"),
defaultValue:"members"
},

membershipIds:{
type:DataTypes.JSON
},

notifyMembers:{
type:DataTypes.BOOLEAN,
defaultValue:false
},

visibility:{
  type:DataTypes.ENUM("public","admin"),
  defaultValue:"public"
},

isSystem:{
  type:DataTypes.BOOLEAN,
  defaultValue:false
},

views:{
  type:DataTypes.INTEGER,
  defaultValue:0
},

status:{
type:DataTypes.ENUM("approved","pending"),
defaultValue:"approved"
}

},{
tableName:"community_posts",
timestamps:true
});

module.exports = CommunityPost;