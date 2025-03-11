// src/middleware/auth.js
const jwt = require('jsonwebtoken');
const { pool } = require('../config/db');

const auth = async (req, res, next) => {
  try {
    // Get token from header
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user exists
    const [user] = await pool.query(
      'SELECT UserID, Name, Email, Role FROM users WHERE UserID = ?',
      [decoded.id]
    );

    if (user.length === 0) {
      return res.status(401).json({ message: 'User not found' });
    }

    // Add user to request
    req.user = user[0];
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

// Middleware to check if user is admin
const isAdmin = (req, res, next) => {
  if (req.user.Role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

// Middleware to check if user is librarian or admin
const isLibrarianOrAdmin = (req, res, next) => {
  if (req.user.Role !== 'Admin' && req.user.Role !== 'Librarian') {
    return res.status(403).json({ message: 'Access denied. Librarian or Admin privileges required.' });
  }
  next();
};

module.exports = { auth, isAdmin, isLibrarianOrAdmin };