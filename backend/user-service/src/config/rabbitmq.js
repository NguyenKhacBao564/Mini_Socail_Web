const amqp = require('amqplib');

let channel = null;
let connection = null;
// IMPORTANT: We use the same queue name as Notification Service listens to
const QUEUE_NAME = 'notification_events'; 
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

const connect = async (retries = 5) => {
  if (connection) return;
  while (retries) {
    try {
      connection = await amqp.connect(RABBITMQ_URL);
      channel = await connection.createChannel();
      await channel.assertQueue(QUEUE_NAME, { durable: true });
      console.log('[RabbitMQ] User Service connected');
      connection.on('close', () => { connection = null; channel = null; setTimeout(connect, 5000); });
      return;
    } catch (err) {
      console.error(`[RabbitMQ] Connection failed`, err.message);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

const publishToQueue = async (data) => {
  try {
    if (!channel) await connect();
    if (channel) {
      channel.sendToQueue(QUEUE_NAME, Buffer.from(JSON.stringify(data)), { persistent: true });
      return true;
    }
    return false;
  } catch (error) {
    console.error('[RabbitMQ] Error publishing', error);
    return false;
  }
};

module.exports = { connect, publishToQueue };
