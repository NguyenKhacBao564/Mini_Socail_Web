const express = require('express');
const sequelize = require('./config/database');
const userController = require('./controllers/UserController');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());

// Routes
const router = express.Router();
router.post('/register', userController.register);
router.post('/login', userController.login);
app.use('/api/users', router);

// Health Check
app.get('/health', (req, res) => res.send('User Service is OK'));

// Start Server & DB Connection
const start = async () => {
  try {
    await sequelize.sync(); // Sync Database
    console.log('📦 Database connected and synced');
    app.listen(PORT, () => console.log(`🚀 User Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

start();