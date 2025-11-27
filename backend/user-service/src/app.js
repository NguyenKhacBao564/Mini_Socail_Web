const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const sequelize = require('./config/database');
const userController = require('./controllers/UserController');
const User = require('./models/User');
const Follow = require('./models/Follow');

// Define Associations
User.belongsToMany(User, { as: 'Followers', through: Follow, foreignKey: 'followingId' });
User.belongsToMany(User, { as: 'Following', through: Follow, foreignKey: 'followerId' });

const app = express();
const PORT = process.env.PORT || 3001;

// Configure Multer
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

app.use(express.json());

// Serve static uploads
app.use('/user-assets', express.static(uploadDir));

// Routes
const router = express.Router();
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/following-ids', userController.getFollowingIds);
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
    await sequelize.sync({ alter: true }); // Sync Database and alter tables to match models
    console.log('📦 Database connected and synced');
    app.listen(PORT, () => console.log(`🚀 User Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};


start();
