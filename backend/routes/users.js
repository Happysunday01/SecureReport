// backend/routes/users.js
const express = require('express');
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { hashPassword, rowToObject } = require('../utils/dbHelpers');

const router = express.Router();

// GET /api/users
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const users = db.prepare('SELECT * FROM users ORDER BY createdAt DESC').all();
    const usersData = users.map(rowToObject);
    res.json({ success: true, users: usersData });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/email/:email
router.get('/email/:email', protect, async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(req.params.email.toLowerCase());
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: rowToObject(user) });
  } catch (error) {
    console.error('Get user by email error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/users/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: rowToObject(user) });
  } catch (error) {
    console.error('Get user by ID error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/users
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, email, password, role, department } = req.body;
    
    // Check if user exists
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Hash password
    const hashedPassword = await hashPassword(password);
    
    // Create user
    const stmt = db.prepare(`
      INSERT INTO users (email, password, name, role, department, approved, active)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      email.toLowerCase(),
      hashedPassword,
      name,
      role,
      department || '',
      role === 'admin' ? 1 : 0,
      1
    );
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(result.lastInsertRowid);
    
    res.status(201).json({ success: true, user: rowToObject(user) });
    
  } catch (error) {
    console.error('Create user error:', error);
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE' || error.message.includes('UNIQUE constraint failed')) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/users/:id/approve
router.patch('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const stmt = db.prepare(`
      UPDATE users 
      SET approved = 1, active = 1, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(req.params.id);
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: rowToObject(user) });
  } catch (error) {
    console.error('Approve user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/users/:id
router.patch('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { active, approved, role, department, name } = req.body;
    
    const stmt = db.prepare(`
      UPDATE users 
      SET active = COALESCE(?, active),
          approved = COALESCE(?, approved),
          role = COALESCE(?, role),
          department = COALESCE(?, department),
          name = COALESCE(?, name),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      active !== undefined ? (active ? 1 : 0) : undefined,
      approved !== undefined ? (approved ? 1 : 0) : undefined,
      role || undefined,
      department || undefined,
      name || undefined,
      req.params.id
    );
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user: rowToObject(user) });
  } catch (error) {
    console.error('Update user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/users/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    // Prevent deleting yourself
    if (parseInt(req.params.id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(req.params.id);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Prevent deleting other admins
    if (user.role === 'admin') {
      return res.status(403).json({ success: false, message: 'Cannot delete admin accounts' });
    }
    
    db.prepare('DELETE FROM users WHERE id = ?').run(req.params.id);
    
    res.json({ success: true, message: 'User deleted successfully' });
    
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;