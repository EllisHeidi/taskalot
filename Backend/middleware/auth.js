const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'taskalot-super-secret-key-change-in-production';

// Verifies the JWT token sent in the Authorization header.
// Attaches the decoded user payload to req.user if valid.
module.exports = function authMiddleware(req, res, next) {
  const authHeader = req.headers['authorization'];

  // Expect header format: "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, email, name }
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
