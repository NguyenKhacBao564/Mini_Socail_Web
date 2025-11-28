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


app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
}));

// Previously, these proxied static asset servers. With GCS, direct access is used.
// Removing these as they are no longer necessary and would point to non-existent endpoints.
// app.use('/uploads', createProxyMiddleware({ target: POST_SERVICE_URL, changeOrigin: true }));
// app.use('/user-assets', createProxyMiddleware({ target: USER_SERVICE_URL, changeOrigin: true }));


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
