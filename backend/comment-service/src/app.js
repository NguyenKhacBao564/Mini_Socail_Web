const express = require('express');
const cors = require('cors');
require('dotenv').config();
const sequelize = require('./config/database');
const commentController = require('./controllers/CommentController');

const app = express();
const PORT = process.env.PORT || 3003;

app.use(cors());
app.use(express.json());

// Routes
const router = express.Router();
router.post('/', commentController.create);
router.get('/:postId', commentController.getByPostId);
app.use('/', router);

// Health Check
app.get('/health', (req, res) => res.send('Comment Service is OK'));

const start = async () => {
  try {
    await sequelize.sync();
    console.log('📦 Comment DB connected');
    app.listen(PORT, () => console.log(`🚀 Comment Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

start();
