const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers['x-access-token'];
  const token = authHeader && authHeader.split(' ')[1]; // Extract the token from the header

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Access denied, token missing.' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Invalid token.' });
    }
    req.user = user; // Attach the user information to the request
    next(); // Proceed to the next middleware or route handler
  });
};

module.exports = authMiddleware;
