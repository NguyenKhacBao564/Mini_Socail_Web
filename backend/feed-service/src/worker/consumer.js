const amqp = require('amqplib');

const QUEUE_NAME = 'post_events';
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://guest:guest@rabbitmq:5672';

const startConsumer = async () => {
  let retries = 5;
  while (retries) {
    try {
      console.log(`[Feed-Worker] Connecting to RabbitMQ at ${RABBITMQ_URL}...`);
      const connection = await amqp.connect(RABBITMQ_URL);
      const channel = await connection.createChannel();

      await channel.assertQueue(QUEUE_NAME, { durable: true });
      
      console.log(`[Feed-Worker] Waiting for messages in ${QUEUE_NAME}.`);

      channel.consume(QUEUE_NAME, (msg) => {
        if (msg !== null) {
          try {
            const content = JSON.parse(msg.content.toString());
            console.log(`[FEED-SERVICE] Received new post event:`, JSON.stringify(content, null, 2));
            
            // TODO: Logic to update feed in database will go here
            
            channel.ack(msg);
          } catch (err) {
            console.error('[Feed-Worker] Error processing message:', err);
            // Decide whether to ack, nack, or reject based on error type
            // For now, we ack to avoid infinite loops on bad JSON
            channel.ack(msg); 
          }
        }
      });

      connection.on('close', () => {
        console.error('[Feed-Worker] Connection closed, retrying...');
        setTimeout(startConsumer, 5000);
      });

      connection.on('error', (err) => {
        console.error('[Feed-Worker] Connection error', err);
      });

      return; // Successfully connected
    } catch (err) {
      console.error(`[Feed-Worker] Connection failed. Retries left: ${retries - 1}`, err.message);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
  console.error('[Feed-Worker] Could not connect to RabbitMQ after multiple attempts');
};

module.exports = { startConsumer };
