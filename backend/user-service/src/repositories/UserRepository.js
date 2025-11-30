const User = require('../models/User');

class UserRepository {
  async create(userData) {
    return await User.create(userData);
  }

  async findByEmail(email) {
    return await User.findOne({ where: { email } });
  }

  async findById(id) {
    return await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });
  }

  async findByIdWithPassword(id) {
    return await User.findByPk(id);
  }

  async update(id, updates) {
    return await User.update(updates, {
      where: { id }
    });
  }
}

module.exports = new UserRepository();