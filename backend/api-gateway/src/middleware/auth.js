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
    
    req.headers['x-user-id'] = verified.id;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token Expired', code: 'TOKEN_EXPIRED' });
    }
    return res.status(401).json({ message: 'Invalid Token', code: 'INVALID_TOKEN' });
  }
};

module.exports = verifyToken;