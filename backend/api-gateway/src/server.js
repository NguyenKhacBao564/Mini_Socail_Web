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

// 1. Serve Static Uploads (Proxy to Post Service)
// Requests to http://localhost:3000/uploads/... will go to http://post-service:3002/uploads/...
app.use('/uploads', createProxyMiddleware({
  target: 'http://post-service:3002',
  changeOrigin: true,
  // No path rewrite needed because Post Service serves at /uploads
}));

// 2. Public Routes
app.use('/api/users', createProxyMiddleware({
  target: 'http://user-service:3001',
  changeOrigin: true,
  pathRewrite: { '^/api/users': '/api/users' },
}));

// 3. Protected Routes
const protectedRoutes = {
  '/api/posts': 'http://post-service:3002',
  '/api/comments': 'http://comment-service:3003',
  '/api/feed':  'http://feed-service:3004',
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