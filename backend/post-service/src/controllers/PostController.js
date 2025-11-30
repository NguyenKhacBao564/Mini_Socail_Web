const postService = require('../services/PostService');
const Post = require('../models/Post');
const Like = require('../models/Like');
const sequelize = require('../config/database');
// CRITICAL: Ensure Op is imported for search functionality
const { Op } = require('sequelize');
const uploadToGCS = require('../utils/gcsUpload');
const { publishToQueue } = require('../config/rabbitmq');

class PostController {
  async create(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      const { content } = req.body;
      
      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      // Upload image to GCS if present
      let imageUrl = null;
      if (req.file) {
        try {
          imageUrl = await uploadToGCS(req.file);
        } catch (uploadError) {
          return res.status(500).json({ success: false, message: 'Image upload failed' });
        }
      }

      const post = await postService.createPost({ userId, content, imageUrl });
      res.status(201).json({ success: true, data: post });
    } catch (error) {
      console.error("Create Error:", error);
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async delete(req, res) {
    try {
      const userId = req.headers['x-user-id'];
      const postId = req.params.id;

      if (!userId) {
        return res.status(401).json({ success: false, message: 'Unauthorized' });
      }

      const post = await Post.findByPk(postId);

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      // Check ownership (loose equality for string/number difference)
      if (post.userId != userId) {
        return res.status(403).json({ success: false, message: 'Forbidden' });
      }

      await post.destroy();
      res.status(200).json({ success: true, message: 'Post deleted' });
    } catch (error) {
      console.error("Delete Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getById(req, res) {
    try {
      const currentUserId = req.headers['x-user-id'];
      const postId = req.params.id;

      // FAILSAFE: If postId is not a number, it might be a route collision (e.g. "search")
      if (isNaN(postId)) {
         return res.status(400).json({ success: false, message: 'Invalid Post ID' });
      }

      const post = await Post.findOne({
        where: { id: postId },
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
        group: ['Post.id']
      });

      if (!post) {
        return res.status(404).json({ success: false, message: 'Post not found' });
      }

      let isLiked = false;
      if (currentUserId) {
        const like = await Like.findOne({
          where: { userId: currentUserId, postId }
        });
        isLiked = !!like;
      }

      const json = post.toJSON();
      const result = {
        ...json,
        isLiked
      };

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("GetById Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async search(req, res) {
    try {
      const currentUserId = req.headers['x-user-id'];
      const { q } = req.query;

      if (!q) {
        return res.status(200).json({ success: true, data: [] });
      }

      const posts = await Post.findAll({
        where: {
          content: {
            [Op.iLike]: `%${q}%`
          }
        },
        order: [['createdAt', 'DESC']],
        limit: 20
      });

      const postIds = posts.map(p => p.id);
      
      const likeCounts = await Like.findAll({
        where: { postId: { [Op.in]: postIds } },
        attributes: [
          'postId',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count']
        ],
        group: ['postId']
      });

      const likeCountMap = {};
      likeCounts.forEach(lc => {
        likeCountMap[lc.postId] = parseInt(lc.get('count'));
      });

      let likedPostIds = new Set();
      if (currentUserId) {
        const userLikes = await Like.findAll({
          where: { userId: currentUserId, postId: { [Op.in]: postIds } },
          attributes: ['postId']
        });
        likedPostIds = new Set(userLikes.map(l => l.postId));
      }

      const result = posts.map(p => {
        const json = p.toJSON();
        return {
          ...json,
          likesCount: likeCountMap[json.id] || 0,
          isLiked: likedPostIds.has(json.id)
        };
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error("Search Error:", error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getAll(req, res) {
    try {
      const currentUserId = req.headers['x-user-id'];
      const filterUserId = req.query.userId; 
      const filterUserIds = req.query.userIds; 

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

        // Notification Logic
        try {
          const post = await Post.findByPk(postId);
          if (post && post.userId != userId) { 
             await publishToQueue({
               type: 'POST_LIKED',
               recipientId: post.userId,
               senderId: userId,
               postId: post.id
             });
          }
        } catch (err) {
          console.error("Failed to publish notification", err);
        }

        return res.status(201).json({ success: true, isLiked: true });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new PostController();