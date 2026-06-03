// backend/routes/auth.js
const express = require('express');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const { protect } = require('../middleware/auth');
const { hashPassword, comparePassword, rowToObject } = require('../utils/dbHelpers');
const { sendPasswordResetEmail } = require('../utils/email');

const router = express.Router();

const generateToken = (userId) => {
  return jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: '24h'
  });
};

// POST /api/auth/send-reset-otp
router.post('/send-reset-otp', async (req, res) => {
  try {
    const { email, otp, expiresAt } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();
    const normalizedOtp = String(otp || '').trim();

    if (!normalizedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ success: false, message: 'Please provide a valid email address' });
    }

    if (!/^\d{6}$/.test(normalizedOtp)) {
      return res.status(400).json({ success: false, message: 'Reset code must be 6 digits' });
    }

    await sendPasswordResetEmail(normalizedEmail, normalizedOtp, expiresAt);

    res.json({
      success: true,
      message: 'Password reset code sent'
    });
  } catch (error) {
    console.error('Send reset OTP error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Unable to send reset code'
    });
  }
});

// POST /api/auth/login
// Accepts optional role parameter. If provided, validates it matches.
// If not provided, authenticates and returns user's actual role.
router.post('/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Please provide email and password' 
      });
    }
    
    // Find user with password
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());
    
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // If role is provided, validate it (for backward compatibility)
    // If role is not provided, skip validation and allow login
    if (role && user.role !== role) {
      return res.status(403).json({ success: false, message: `Account is ${user.role}, not ${role}` });
    }
    
    // Check password
    const isMatch = await comparePassword(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
    
    // Check if active
    if (!user.active) {
      return res.status(403).json({ success: false, message: 'Account is deactivated' });
    }
    
    // Check if approved (except for admins)
    if (!user.approved && user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Account pending approval' });
    }
    
    // Generate token
    const token = generateToken(user.id);
    
    // Return user data (without password)
    const userData = rowToObject(user);
    
    res.json({ success: true, user: userData, token });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Server error during login' });
  }
});

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, department } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password' });
    }
    
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, role, department, active, approved, verified)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      email.toLowerCase(),
      hashedPassword,
      name,
      'student',
      department || 'General',
      1,
      0,
      0
    );
    
    // Get the created user
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({
      success: true,
      message: 'Account created. Waiting for admin approval.',
      user: rowToObject(user)
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    res.status(500).json({ success: false, message: 'Server error during signup' });
  }
});

// GET /api/auth/me
router.get('/me', protect, async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: rowToObject(user) });
    
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
