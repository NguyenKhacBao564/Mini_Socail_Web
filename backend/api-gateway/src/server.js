require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('./middleware/auth');
const cors = require('cors'); 

const app = express();
const PORT = 3000;

// Define Service URLs with environment variable overrides or Docker service defaults
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://user-service:3001';
const POST_SERVICE_URL = process.env.POST_SERVICE_URL || 'http://post-service:3002';
const COMMENT_SERVICE_URL = process.env.COMMENT_SERVICE_URL || 'http://comment-service:3003';
const NOTIFICATION_SERVICE_URL = process.env.NOTIFICATION_SERVICE_URL || 'http://notification-service:3005';
const FEED_SERVICE_URL = process.env.FEED_SERVICE_URL || 'http://feed-service:3004';

// Configure CORS dynamically
const allowedOrigins = ['http://localhost:5173'];
const frontendUrl = process.env.FRONTEND_URL;

if (frontendUrl) {
  allowedOrigins.push(frontendUrl);
}

app.use(cors({ 
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = `The CORS policy for this site does not allow access from the specified Origin: ${origin}`;
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true 
}));

// WebSocket Proxy (Socket.io)
app.use('/socket.io', createProxyMiddleware({
  target: NOTIFICATION_SERVICE_URL,
  changeOrigin: true,
  ws: true, // Enable WebSocket support
}));

// Public Routes
app.use(['/api/users/login', '/api/users/register'], createProxyMiddleware({
  target: USER_SERVICE_URL,
  changeOrigin: true,
}));

// Protected Routes
const protectedRoutes = {
  '/api/users': USER_SERVICE_URL, 
  '/api/posts': POST_SERVICE_URL,
  '/api/comments': COMMENT_SERVICE_URL,
  '/api/feed':  FEED_SERVICE_URL,
  '/api/notifications': NOTIFICATION_SERVICE_URL,
};

for (const [path, target] of Object.entries(protectedRoutes)) {
  app.use(path, verifyToken, createProxyMiddleware({
    target,
    changeOrigin: true,
    onProxyReq: (proxyReq, req, res) => {
      if (req.headers['x-user-id']) {
        proxyReq.setHeader('x-user-id', req.headers['x-user-id']);
      }
    },
    pathRewrite: { [`^${path}`]: path },
  }));
}

app.listen(PORT, () => {
  console.log(`Gateway running on port ${PORT}`);
});