const express = require('express');
const multer = require('multer');
const sequelize = require('./config/database');
const postController = require('./controllers/PostController');
require('./models/Like'); 

const app = express();
const PORT = process.env.PORT || 3002;

// Configure Multer with Memory Storage (Stream to GCS)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.json());

// Routes
const router = express.Router();

// Upload middleware stores file in memory, Controller uploads to GCS
router.post('/', upload.single('image'), postController.create);
router.get('/', postController.getAll);

// CRITICAL: Define /search BEFORE /:id to prevent ID collision
router.get('/search', postController.search);

router.get('/:id', postController.getById);
router.delete('/:id', postController.delete);
router.post('/:id/like', postController.toggleLike);

app.use('/', router);

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