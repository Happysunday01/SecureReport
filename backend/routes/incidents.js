// backend/routes/incidents.js
const express = require('express');
const db = require('../config/database');
const { protect, authorize } = require('../middleware/auth');
const { rowToObject, parseEvidence } = require('../utils/dbHelpers');

const router = express.Router();

function determineIncidentPriority(type, description = '') {
  const normalizedType = String(type || '').toLowerCase();
  const normalizedDescription = String(description || '').toLowerCase();

  if (normalizedType.includes('medical') || normalizedType.includes('emergency')) {
    return 'Critical';
  }

  if (normalizedType.includes('safety hazard')) {
    return 'High';
  }

  if (normalizedType.includes('harassment') || normalizedType.includes('bullying')) {
    return 'High';
  }

  if (normalizedType.includes('theft') || normalizedType.includes('vandalism')) {
    return 'Medium';
  }

  if (normalizedType.includes('other')) {
    return 'Medium';
  }

  if (normalizedDescription.match(/\b(urgent|danger|weapon|fire|injury|bleeding|unconscious|dangerous|threat)\b/)) {
    return 'High';
  }

  return 'Medium';
}

// GET /api/incidents
router.get('/', protect, async (req, res) => {
  try {
    let query = 'SELECT * FROM incidents';
    let params = [];
    
    if (req.user.role === 'student') {
      query += ' WHERE reportedBy = ?';
      params.push(req.user.id);
    } else if (req.user.role === 'security') {
      query += ' WHERE assignedTo = ?';
      params.push(req.user.id);
    }
    
    query += ' ORDER BY createdAt DESC';
    
    const incidents = db.prepare(query).all(...params);
    
    // Get timeline for each incident
    const incidentsWithTimeline = incidents.map(incident => {
      const timeline = db.prepare('SELECT * FROM timeline WHERE incidentId = ? ORDER BY date ASC').all(incident.id);
      return {
        ...rowToObject(incident),
        evidence: parseEvidence(incident.evidence),
        timeline: timeline.map(t => rowToObject(t))
      };
    });
    
    res.json({ success: true, incidents: incidentsWithTimeline });
    
  } catch (error) {
    console.error('Get incidents error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// GET /api/incidents/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    
    // Check authorization
    if (req.user.role === 'student' && incident.reportedBy !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this incident' });
    }
    if (req.user.role === 'security' && incident.assignedTo !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to view this incident' });
    }
    
    const timeline = db.prepare('SELECT * FROM timeline WHERE incidentId = ? ORDER BY date ASC').all(incident.id);
    
    res.json({
      success: true,
      incident: {
        ...rowToObject(incident),
        evidence: parseEvidence(incident.evidence),
        timeline: timeline.map(t => rowToObject(t))
      }
    });
    
  } catch (error) {
    console.error('Get incident error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// POST /api/incidents
router.post('/', protect, async (req, res) => {
  try {
    const {
      type, location, datetime, description,
      anonymous, evidence, lat, lng
    } = req.body;
    const priority = determineIncidentPriority(type, description);
    
    const stmt = db.prepare(`
      INSERT INTO incidents (
        type, priority, location, datetime, description,
        reportedBy, reportedByName, anonymous, evidence, lat, lng, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(
      type,
      priority,
      location || '',
      datetime || null,
      description || '',
      req.user.id,
      anonymous ? 'Anonymous' : req.user.name,
      anonymous ? 1 : 0,
      evidence ? JSON.stringify(evidence) : null,
      lat || null,
      lng || null,
      'Pending'
    );
    
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(result.lastInsertRowid);
    
    // Create timeline entry
    db.prepare(`
      INSERT INTO timeline (incidentId, userName, action, date)
      VALUES (?, ?, ?, ?)
    `).run(
      incident.id,
      anonymous ? 'Anonymous' : req.user.name,
      'Report submitted',
      new Date().toISOString()
    );
    
    res.status(201).json({ 
      success: true, 
      incident: {
        ...rowToObject(incident),
        evidence: parseEvidence(incident.evidence)
      }
    });
    
  } catch (error) {
    console.error('Create incident error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// PATCH /api/incidents/:id
router.patch('/:id', protect, authorize('security', 'admin', 'coordinator'), async (req, res) => {
  try {
    const { status, assignedTo, priority, notes } = req.body;
    
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    
    if (req.user.role === 'security' && incident.assignedTo !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized to update this incident' });
    }
    if (assignedTo && req.user.role === 'security') {
      return res.status(403).json({ success: false, message: 'Security staff cannot assign officers' });
    }
    
    // Update incident
    const stmt = db.prepare(`
      UPDATE incidents 
      SET status = COALESCE(?, status),
          assignedTo = COALESCE(?, assignedTo),
          priority = COALESCE(?, priority),
          updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    stmt.run(
      status || undefined,
      assignedTo || undefined,
      priority || undefined,
      req.params.id
    );
    
    // Add timeline entry if status changed
    if (status && status !== incident.status) {
      db.prepare(`
        INSERT INTO timeline (incidentId, userName, action, date)
        VALUES (?, ?, ?, ?)
      `).run(
        incident.id,
        req.user.name,
        `Status changed from ${incident.status} to ${status}`,
        new Date().toISOString()
      );
    }
    
    // Add timeline entry for notes
    if (notes) {
      db.prepare(`
        INSERT INTO timeline (incidentId, userName, action, notes, date)
        VALUES (?, ?, ?, ?, ?)
      `).run(
        incident.id,
        req.user.name,
        'Added comment/update',
        notes,
        new Date().toISOString()
      );
    }
    
    const updatedIncident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    
    res.json({ 
      success: true, 
      incident: {
        ...rowToObject(updatedIncident),
        evidence: parseEvidence(updatedIncident.evidence)
      }
    });
    
  } catch (error) {
    console.error('Update incident error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

// DELETE /api/incidents/:id
router.delete('/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const incident = db.prepare('SELECT * FROM incidents WHERE id = ?').get(req.params.id);
    
    if (!incident) {
      return res.status(404).json({ success: false, message: 'Incident not found' });
    }
    
    // Delete timeline entries first (or use CASCADE)
    db.prepare('DELETE FROM timeline WHERE incidentId = ?').run(req.params.id);
    db.prepare('DELETE FROM incidents WHERE id = ?').run(req.params.id);
    
    res.json({ success: true, message: 'Incident deleted successfully' });
    
  } catch (error) {
    console.error('Delete incident error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;