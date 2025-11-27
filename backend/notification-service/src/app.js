const express = require('express');
const sequelize = require('./config/database');
const Notification = require('./models/Notification');
const { startConsumer } = require('./worker/notificationConsumer');

const app = express();
const PORT = process.env.PORT || 3005;

app.use(express.json());

// API: Get Notifications for current user
// We expect x-user-id header from Gateway
app.get('/api/notifications', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' });

    const notifications = await Notification.findAll({
      where: { recipientId: userId },
      order: [['createdAt', 'DESC']],
      limit: 50
    });

    res.status(200).json({ success: true, data: notifications });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: error.message });
  }
});

app.get('/health', (req, res) => res.send('Notification Service is OK'));

const start = async () => {
  try {
    await sequelize.sync({ alter: true });
    console.log('📦 Notification DB connected');
    
    // Start RabbitMQ Consumer
    startConsumer();

    app.listen(PORT, () => console.log(`🚀 Notification Service running on port ${PORT}`));
  } catch (error) {
    console.error('Unable to start server:', error);
  }
};

start();
