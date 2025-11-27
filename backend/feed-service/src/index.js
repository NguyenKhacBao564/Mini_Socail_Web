require('dotenv').config();
const express = require('express');
const { startConsumer } = require('./worker/consumer');

const app = express();
const PORT = process.env.PORT || 3004;

app.use(express.json());

app.get('/health', (req, res) => {
  res.status(200).json({ status: 'Feed Service is OK' });
});

// Start the RabbitMQ Consumer
startConsumer().catch(err => {
    console.error('Failed to start RabbitMQ consumer:', err);
});

app.listen(PORT, () => {
  console.log(`Feed Service running on port ${PORT}`);
});
