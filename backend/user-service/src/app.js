const express = require('express');
const multer = require('multer');
const sequelize = require('./config/database');
const userController = require('./controllers/UserController');
const User = require('./models/User');
const Follow = require('./models/Follow');

// Define Associations
User.belongsToMany(User, { as: 'Followers', through: Follow, foreignKey: 'followingId' });
User.belongsToMany(User, { as: 'Following', through: Follow, foreignKey: 'followerId' });

const app = express();
const PORT = process.env.PORT || 3001;

// Configure Multer with Memory Storage (Stream to GCS)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Routes
const router = express.Router();
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/search', userController.search);
router.get('/following-ids', userController.getFollowingIds);
router.get('/batch', userController.getUsersByIds); // Batch fetch route
router.put('/profile', upload.fields([{ name: 'avatar', maxCount: 1 }, { name: 'cover', maxCount: 1 }]), userController.updateProfile);
router.get('/:id', userController.getProfile);
router.post('/:id/follow', userController.followUser);
router.delete('/:id/follow', userController.unfollowUser);

app.use('/api/users', router);

// Health Check
app.get('/health', (req, res) => res.send('User Service is OK'));

// Start Server & DB Connection
const start = async () => {
  try {
    await sequelize.sync({ alter: true }); 
    console.log('📦 Database connected and synced');
    app.listen(PORT, () => console.log(`🚀 User Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};


start();