const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  const token = req.header('Authorization')?.split(' ')[1]; // Extract token from Authorization header

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_default_secret');
    req.admin = decoded; // Store decoded token data in request object
    next(); // Pass control to the next middleware
  } catch (ex) {
    res.status(400).json({ status: 'error', message: 'Invalid token.' });
  }
};

module.exports = adminAuthMiddleware;
