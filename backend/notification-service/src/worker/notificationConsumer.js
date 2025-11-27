const amqp = require('amqplib');
const Notification = require('../models/Notification');

const QUEUE_NAME = 'notification_events';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

const startConsumer = async () => {
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

            // Save notification to DB
            await Notification.create({
              recipientId: content.recipientId,
              senderId: content.senderId,
              type: content.type, // e.g. 'POST_LIKED', 'USER_FOLLOWED'
              postId: content.postId || null
            });

            channel.ack(msg);
          } catch (err) {
            console.error('[Notification-Worker] Error processing message:', err);
            // channel.nack(msg); // Use nack with requeue=false or similar if needed
            channel.ack(msg); // Ack to avoid loop for now
          }
        }
      });

      connection.on('close', () => {
        console.error('[Notification-Worker] Connection closed, retrying...');
        setTimeout(startConsumer, 5000);
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
