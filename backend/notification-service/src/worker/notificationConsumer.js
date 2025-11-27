const amqp = require('amqplib');
const Notification = require('../models/Notification');

const QUEUE_NAME = 'notification_events';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

// Now accepts `io` instance
const startConsumer = async (io) => {
  let retries = 5;
  while (retries) {
    try {
      console.log(`[Notification-Worker] Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log(`[Notification-Worker] Waiting for messages in ${QUEUE_NAME}.`);

      channel.consume(QUEUE_NAME, async (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`[Notification-Service] Received event:`, content);

            // 1. Save notification to DB
            const notification = await Notification.create({
              recipientId: content.recipientId,
              senderId: content.senderId,
              type: content.type,
              postId: content.postId || null
            });

            // 2. Emit Real-Time Event
            if (io) {
              // Emit to the specific user's room
              io.to(`user_${content.recipientId}`).emit('new_notification', notification);
              console.log(`[Socket] Emitted 'new_notification' to user_${content.recipientId}`);
            }

            channel.ack(msg);
          } catch (err) {
            console.error('[Notification-Worker] Error processing message:', err);
            channel.ack(msg);
          }
        }
      });

      connection.on('close', () => {
        console.error('[Notification-Worker] Connection closed, retrying...');
        setTimeout(() => startConsumer(io), 5000);
      });

      return;
    } catch (err) {
      console.error(`[Notification-Worker] Connection failed. Retries left: ${retries - 1}`, err.message);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

module.exports = { startConsumer };