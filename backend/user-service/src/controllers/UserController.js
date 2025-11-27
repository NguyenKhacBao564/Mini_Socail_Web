const userService = require('../services/UserService');

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
      console.log('Login Request Body:', req.body); // Debug log
      const result = await userService.login(req.body.email, req.body.password);
      res.status(200).json({ success: true, data: result });
    } catch (error) {
      console.error('Login Error:', error.message); // Debug log
      res.status(401).json({ success: false, message: error.message });
    }
  }
}

module.exports = new UserController();