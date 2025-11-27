const express = require('express');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const sequelize = require('./config/database');
const postController = require('./controllers/PostController');
require('./models/Like'); 

const app = express();
const PORT = process.env.PORT || 3002;

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
// Access via: http://localhost:3000/uploads/filename.jpg
app.use('/uploads', express.static(uploadDir));

// Routes
const router = express.Router();

// Use upload.single('image') middleware for creating posts
router.post('/', upload.single('image'), postController.create);
router.get('/', postController.getAll);
router.post('/:id/like', postController.toggleLike);

app.use('/api/posts', router);

// Health Check
app.get('/health', (req, res) => res.send('Post Service is OK'));

const start = async () => {
  try {
    await sequelize.sync(); 
    console.log('📦 Post DB connected');
    app.listen(PORT, () => console.log(`🚀 Post Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

start();