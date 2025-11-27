const amqp = require('amqplib');

let channel = null;
let connection = null;
const QUEUE_NAME = 'notification_events'; // UPDATED Queue Name
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

const connect = async (retries = 5) => {
  if (connection) return;

  while (retries) {
    try {
      console.log(`[RabbitMQ] Connecting to ${RABBITMQ_URL}...`);
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log('[RabbitMQ] Connected and queue asserted');
      
      connection.on('close', () => {
        console.error('[RabbitMQ] Connection closed, retrying...');
        connection = null;
        channel = null;
        setTimeout(() => connect(), 5000);
      });
      
      connection.on('error', (err) => {
        console.error('[RabbitMQ] Connection error', err);
      });

      return;
    } catch (err) {
      console.error(`[RabbitMQ] Connection failed. Retries left: ${retries - 1}`, err.message);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  console.error('[RabbitMQ] Could not connect after multiple attempts');
};

const publishToQueue = async (data) => {
  try {
    if (!channel) {
      await connect();
    }
    if (channel) {
      const message = JSON.stringify(data);
      channel.sendToQueue(QUEUE_NAME, Buffer.from(message), { persistent: true });
      console.log(`[RabbitMQ] Sent message to ${QUEUE_NAME}`);
      return true;
    } else {
      console.error('[RabbitMQ] Channel not available to publish');
      return false;
    }
  } catch (error) {
    console.error('[RabbitMQ] Error publishing message:', error);
    return false;
  }
};

module.exports = { connect, publishToQueue };
