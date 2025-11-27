const userRepository = require('../repositories/UserRepository');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

class UserService {
  async register(data) {
    const email = data.email.trim();
    const existingUser = await userRepository.findByEmail(email);
    if (existingUser) {
      throw new Error('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await userRepository.create({
      ...data,
      email, // Use trimmed email
      password: hashedPassword
    });

    // Remove password from return object
    const { password, ...userWithoutPassword } = user.toJSON();
    return userWithoutPassword;
  }

  async login(email, password) {
    const cleanEmail = email.trim();
    const user = await userRepository.findByEmail(cleanEmail);
    if (!user) throw new Error(`User not found: ${cleanEmail}`);

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Password incorrect');

    const token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'secret_key',
      { expiresIn: '24h' }
    );

    return { token, user: { id: user.id, username: user.username } };
  }
}

module.exports = new UserService();