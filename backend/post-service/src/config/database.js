const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'social_db',
  process.env.DB_USER || 'admin',
  process.env.DB_PASS || 'password123',
  {
    host: process.env.DB_HOST || 'postgres',
    dialect: 'postgres',
    logging: false,
  }
);

module.exports = sequelize;