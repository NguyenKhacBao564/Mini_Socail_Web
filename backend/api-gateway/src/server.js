require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const verifyToken = require('./middleware/auth');
const cors = require('cors'); 

const app = express();
const PORT = 3000;

app.use(cors({ 
  origin: 'http://localhost:5173', 
  credentials: true 
}));

// 1. Serve Static Uploads
app.use('/uploads', createProxyMiddleware({
  target: 'http://post-service:3002',
  changeOrigin: true,
}));

app.use('/user-assets', createProxyMiddleware({
  target: 'http://user-service:3001',
  changeOrigin: true,
}));

// 2. Public Routes
app.use(['/api/users/login', '/api/users/register'], createProxyMiddleware({
  target: 'http://user-service:3001',
  changeOrigin: true,
}));

// 3. Protected Routes
const protectedRoutes = {
  '/api/users': 'http://user-service:3001', 
  '/api/posts': 'http://post-service:3002',
  '/api/comments': 'http://comment-service:3003',
  '/api/feed':  'http://feed-service:3004',
  '/api/notifications': 'http://notification-service:3005', // New Route
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