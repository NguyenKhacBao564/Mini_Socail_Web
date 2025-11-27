const postService = require('../services/PostService');
const Post = require('../models/Post');
const Like = require('../models/Like');
const sequelize = require('../config/database');
const { Op } = require('sequelize'); // Import Op for advanced queries

class PostController {
  async create(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      const { content } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Check if image was uploaded
      let imageUrl = null;
      if (req.file) {
        imageUrl = `/uploads/${req.file.filename}`;
      }

      const post = await postService.createPost({ userId, content, imageUrl });
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      console.error("Create Error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const currentUserId = req.headers['x-user-id'];
      const filterUserId = req.query.userId; 
      const filterUserIds = req.query.userIds; // Check for comma separated list

      let whereClause = {};

      if (filterUserId) {
        whereClause = { userId: filterUserId };
      } else if (filterUserIds) {
        const ids = filterUserIds.split(',').map(id => parseInt(id));
        whereClause = { userId: { [Op.in]: ids } };
      }

      const posts = await Post.findAll({
        where: whereClause, 
        include: [
          {
            model: Like,
            attributes: [] 
          }
        ],
        attributes: [
          'id', 'userId', 'content', 'imageUrl', 'createdAt',
          [sequelize.fn('COUNT', sequelize.col('Likes.id')), 'likesCount']
        ],
        group: ['Post.id'],
        order: [['createdAt', 'DESC']]
      });

      let likedPostIds = new Set();
      if (currentUserId) {
        const userLikes = await Like.findAll({
          where: { userId: currentUserId },
          attributes: ['postId']
        });
        likedPostIds = new Set(userLikes.map(l => l.postId));
      }

      const result = posts.map(p => {
        const json = p.toJSON();
        return {
          ...json,
          isLiked: likedPostIds.has(json.id)
        };
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async toggleLike(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      const postId = req.params.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const existingLike = await Like.findOne({ where: { userId, postId } });

      if (existingLike) {
        await existingLike.destroy();
        return res.status(200).json({ success: true, isLiked: false });
      } else {
        await Like.create({ userId, postId });
        return res.status(201).json({ success: true, isLiked: true });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PostController();