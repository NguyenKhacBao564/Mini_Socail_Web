const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  
  if (!authHeader) {
    return res.status(401).json({ message: 'Access Denied: No Token Provided' });
  }

  // Bearer <token>
  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ message: 'Access Denied: Malformed Token' });
  }

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    
    // Inject User ID into headers for downstream services
    // Note: Headers are case-insensitive in HTTP, but Node.js conventionally lowercases them
    req.headers['x-user-id'] = verified.id;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid Token' });
  }
};

module.exports = verifyToken;