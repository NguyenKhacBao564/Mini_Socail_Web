const Post = require('../models/Post');

class PostRepository {
  async create(postData) {
    return await Post.create(postData);
  }

  async findAll() {
    // Trong thực tế sẽ cần pagination, ở đây lấy all cho đơn giản
    return await Post.findAll({ order: [['createdAt', 'DESC']] });
  }

  async findById(id) {
    return await Post.findByPk(id);
  }

  async delete(id) {
    return await Post.destroy({ where: { id } });
  }
}

module.exports = new PostRepository();