const postRepository = require('../repositories/PostRepository');
const { publishToQueue } = require('../config/rabbitmq');

class PostService {
  async createPost(data) {
    // 1. Lưu vào DB
    const newPost = await postRepository.create(data);

    // 2. Send event 'post.created' to RabbitMQ for Feed Service
    try {
        await publishToQueue({
            event: 'POST_CREATED',
            data: newPost
        });
        console.log(`[EVENT] Post created: ${newPost.id} - Published to RabbitMQ`);
    } catch (error) {
        console.error('[EVENT] Failed to publish post creation event:', error);
        // Note: In a production system, you might want to store this failed event 
        // in a separate table to retry later (Outbox Pattern)
    }

    return newPost;
  }

  async getAllPosts() {
    return await postRepository.findAll();
  }

  async getPostById(id) {
    const post = await postRepository.findById(id);
    if (!post) throw new Error('Post not found');
    return post;
  }
}

module.exports = new PostService();