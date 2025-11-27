const userService = require('../services/UserService');
const User = require('../models/User');
const Follow = require('../models/Follow');
const sequelize = require('../config/database');

class UserController {
  async register(req, res) {
    try {
      const user = await userService.register(req.body);
      res.status(201).json({ success: true, data: user });
    } catch (error) {
      res.status(400).json({ success: false, message: error.message });
    }
  }

  async login(req, res) {
    try {
      const result = await userService.login(req.body.email, req.body.password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      res.status(401).json({ success: false, message: error.message });
    }
  }

  async getProfile(req, res) {
    try {
      const targetUserId = req.params.id;
      const currentUserId = req.headers['x-user-id'];

      const user = await User.findByPk(targetUserId, {
        attributes: ['id', 'username', 'email', 'createdAt'],
      });

      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      const followersCount = await Follow.count({ where: { followingId: targetUserId } });
      const followingCount = await Follow.count({ where: { followerId: targetUserId } });

      let isFollowing = false;
      if (currentUserId) {
        const followRecord = await Follow.findOne({
          where: {
            followerId: currentUserId,
            followingId: targetUserId
          }
        });
        isFollowing = !!followRecord;
      }

      res.status(200).json({
        success: true,
        data: {
          ...user.toJSON(),
          followersCount,
          followingCount,
          isFollowing
        }
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async followUser(req, res) {
    try {
      const followerId = req.headers['x-user-id'];
      const followingId = req.params.id;

      if (!followerId) return res.status(401).json({ success: false, message: 'Unauthorized' });
      if (followerId == followingId) return res.status(400).json({ success: false, message: 'Cannot follow yourself' });

      const existingFollow = await Follow.findOne({ where: { followerId, followingId } });
      if (existingFollow) {
        return res.status(400).json({ success: false, message: 'Already following' });
      }

      await Follow.create({ followerId, followingId });
      res.status(200).json({ success: true, message: 'Followed successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async unfollowUser(req, res) {
    try {
      const followerId = req.headers['x-user-id'];
      const followingId = req.params.id;

      if (!followerId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const deleted = await Follow.destroy({ where: { followerId, followingId } });
      
      if (deleted) {
        res.status(200).json({ success: true, message: 'Unfollowed successfully' });
      } else {
        res.status(400).json({ success: false, message: 'Not following' });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  async getFollowingIds(req, res) {
    try {
      const currentUserId = req.headers['x-user-id'];
      if (!currentUserId) return res.status(401).json({ success: false, message: 'Unauthorized' });

      const follows = await Follow.findAll({
        where: { followerId: currentUserId },
        attributes: ['followingId']
      });

      const ids = follows.map(f => f.followingId);
      res.status(200).json({ success: true, data: ids });
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();