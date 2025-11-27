const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Post = require('./Post');

const Like = sequelize.define('Like', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  postId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Posts', // Use string table name to avoid definition order issues
      key: 'id'
    }
  }
}, {
  timestamps: true,
  tableName: 'likes'
});

Post.hasMany(Like, { foreignKey: 'postId' });
Like.belongsTo(Post, { foreignKey: 'postId' });

module.exports = Like;
