const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'versa_secret_jwt_sign_key_991823';

// Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, error: 'Access token required.' });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid or expired token.' });
    req.user = user;
    next();
  });
}

// POST /api/v1/relationship/invite-code (Create invite code for pairing)
router.post('/invite-code', authenticateToken, (req, res) => {
  const userId = req.user.userId;

  try {
    // Check if user is already in a pairing
    const existingPairing = db.prepare(`
      SELECT * FROM pairings 
      WHERE (user_a_id = ? OR user_b_id = ?) AND status = 'active'
    `).get(userId, userId);

    if (existingPairing) {
      return res.status(400).json({ success: false, error: 'Already actively paired.', pairingId: existingPairing.id });
    }

    // Generate pairing invite code
    const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    const pairingId = uuidv4();
    const salt = uuidv4();

    db.prepare(`
      INSERT INTO pairings (id, user_a_id, invite_code, status, shared_secret_salt) 
      VALUES (?, ?, ?, 'pending', ?)
    `).run(pairingId, userId, inviteCode, salt);

    res.status(201).json({ success: true, inviteCode, pairingId });
  } catch (error) {
    console.error('Failed to create invite code:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// POST /api/v1/relationship/link (Join pairing via invite code)
router.post('/link', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { inviteCode } = req.body;

  if (!inviteCode) {
    return res.status(400).json({ success: false, error: 'Invite code is required.' });
  }

  try {
    const pairing = db.prepare('SELECT * FROM pairings WHERE invite_code = ? AND status = \'pending\'').get(inviteCode.trim().toUpperCase());
    if (!pairing) {
      return res.status(404).json({ success: false, error: 'Invalid or expired invite code.' });
    }

    if (pairing.user_a_id === userId) {
      return res.status(400).json({ success: false, error: 'Cannot pair with yourself.' });
    }

    // Link partner B
    db.prepare('UPDATE pairings SET user_b_id = ?, status = \'active\' WHERE id = ?')
      .run(userId, pairing.id);

    // Initialize active sync session record
    db.prepare(`
      INSERT OR IGNORE INTO active_sessions (pairing_id, timer_countdown, session_status) 
      VALUES (?, 900, 'Timer_Active')
    `).run(pairing.id);

    res.json({ success: true, message: 'Successfully paired!', pairingId: pairing.id });
  } catch (error) {
    console.error('Failed to link partner:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// POST /api/v1/relationship/unlink/:pairing_id (The Kill Switch)
router.post('/unlink/:pairing_id', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { pairing_id } = req.params;

  try {
    const pairing = db.prepare('SELECT * FROM pairings WHERE id = ?').get(pairing_id);
    if (!pairing) {
      return res.status(404).json({ success: false, error: 'Pairing not found.' });
    }

    if (pairing.user_a_id !== userId && pairing.user_b_id !== userId) {
      return res.status(403).json({ success: false, error: 'Not authorized to sever this connection.' });
    }

    // 1. Purge the Shared Salt (Cryptographic Self-Destruct)
    // 2. Set status to disconnected
    db.prepare('UPDATE pairings SET shared_secret_salt = NULL, status = \'disconnected\' WHERE id = ?')
      .run(pairing_id);

    // 3. Remove active sessions
    db.prepare('DELETE FROM active_sessions WHERE pairing_id = ?').run(pairing_id);

    // 4. Delete user preference quiz replies associated with this pairing
    db.prepare('DELETE FROM blacklisted_desires WHERE user_id = ?').run(pairing.user_a_id);
    if (pairing.user_b_id) {
      db.prepare('DELETE FROM blacklisted_desires WHERE user_id = ?').run(pairing.user_b_id);
    }

    res.json({ success: true, message: 'Partner unlinked and data access revoked.' });
  } catch (error) {
    console.error('Severing connection failed:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// GET /api/v1/relationship/active-session/:pairing_id (REST catch-up endpoint)
router.get('/active-session/:pairing_id', authenticateToken, (req, res) => {
  const { pairing_id } = req.params;

  try {
    let session = db.prepare('SELECT * FROM active_sessions WHERE pairing_id = ?').get(pairing_id);
    if (!session) {
      // Ensure mock pairing exists first to satisfy foreign key constraint
      const existsPairing = db.prepare('SELECT id FROM pairings WHERE id = ?').get(pairing_id);
      if (!existsPairing) {
        db.prepare(`
          INSERT OR IGNORE INTO pairings (id, user_a_id, user_b_id, status)
          VALUES (?, NULL, NULL, 'active')
        `).run(pairing_id);
      }

      // Automatically initialize an active session on first query to prevent 404s during local development/unpaired test runs!
      db.prepare(`
        INSERT INTO active_sessions (pairing_id, timer_countdown, session_status, last_event_triggered)
        VALUES (?, 900, 'Timer_Active', 'INITIALIZED')
      `).run(pairing_id);
      session = db.prepare('SELECT * FROM active_sessions WHERE pairing_id = ?').get(pairing_id);
    }
    res.json({ success: true, session });
  } catch (error) {
    console.error('Failed to get active session state:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// POST /api/v1/relationship/schedule
router.post('/schedule', authenticateToken, (req, res) => {
  const { pairingId, contentId, scheduledFor } = req.body;

  if (!pairingId || !contentId || !scheduledFor) {
    return res.status(400).json({ success: false, error: 'Missing scheduling properties.' });
  }

  try {
    const scheduleId = uuidv4();
    db.prepare(`
      INSERT INTO scheduled_dates (id, pairing_id, content_id, scheduled_for, reminder_sent)
      VALUES (?, ?, ?, ?, 0)
    `).run(scheduleId, pairingId, contentId, scheduledFor);

    res.json({ success: true, message: 'Date scheduled successfully.', scheduleId });
  } catch (error) {
    console.error('Failed to schedule date:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

module.exports = {
  router,
  authenticateToken
};
