// backend/middleware/auth.js
const jwt = require('jsonwebtoken');
const db = require('../config/database');

const protect = async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }
  
  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get user from database
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(decoded.id);
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }
    
    // Check if user is active
    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    
    // Check if user is approved (except for admins)
    if (!user.approved && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Account pending approval' });
    }
    
    // Attach user to request (without password)
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      department: user.department,
      active: Boolean(user.active),
      approved: Boolean(user.approved)
    };
    
    next();
  } catch (error) {
    console.error('Auth error:', error);
    return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        success: false, 
        message: `User role ${req.user?.role} is not authorized to access this route` 
      });
    }
    next();
  };
};

module.exports = { protect, authorize };