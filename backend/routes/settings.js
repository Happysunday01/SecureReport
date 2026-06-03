// backend/routes/settings.js
const express = require('express');
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings
router.get('/', protect, async (req, res) => {
  try {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    res.json({ success: true, settings: settingsObj });
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/settings
router.post('/', protect, authorize('admin'), async (req, res) => {
  try {
    const settings = req.body;
    
    Object.entries(settings).forEach(([key, value]) => {
      db.prepare(`
        INSERT INTO settings (key, value)
        VALUES (?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value
      `).run(key.toUpperCase(), typeof value === 'object' ? JSON.stringify(value) : value);
    });
    
    const updatedSettings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = updatedSettings.reduce((acc, setting) => {
      acc[setting.key] = setting.value;
      return acc;
    }, {});
    
    res.json({ success: true, settings: settingsObj });
    
  } catch (error) {
    console.error('Save settings error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const incidents = db.prepare('SELECT * FROM incidents').all();
    const users = db.prepare('SELECT * FROM users').all();
    
    const stats = {
      totalIncidents: incidents.length,
      pending: incidents.filter(i => i.status === 'Pending').length,
      inProgress: incidents.filter(i => i.status === 'In Progress').length,
      resolved: incidents.filter(i => i.status === 'Resolved').length,
      totalUsers: users.filter(u => u.active && u.approved).length,
      pendingApprovals: users.filter(u => !u.approved).length,
      activeOfficers: users.filter(u => u.role === 'security' && u.active).length,
      resolutionRate: incidents.length > 0
        ? Math.round((incidents.filter(i => i.status === 'Resolved').length / incidents.length) * 100)
        : 0
    };
    
    res.json({ success: true, stats });
    
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;