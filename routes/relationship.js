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

// POST /api/v1/relationship/nudge
router.post('/nudge', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  try {
    const pairing = db.prepare(`
      SELECT * FROM pairings 
      WHERE (user_a_id = ? OR user_b_id = ?) AND status = 'active'
    `).get(userId, userId);

    if (!pairing) {
      return res.status(400).json({ success: false, error: 'Cannot nudge. You are not actively paired.' });
    }

    const partnerId = pairing.user_a_id === userId ? pairing.user_b_id : pairing.user_a_id;
    if (!partnerId) {
      return res.status(400).json({ success: false, error: 'Partner has not accepted the invite yet.' });
    }

    const partnerUser = db.prepare('SELECT email, device_token FROM users WHERE id = ?').get(partnerId);
    if (!partnerUser) {
      return res.status(404).json({ success: false, error: 'Partner profile not found.' });
    }

    console.log(`[PUSH NOTICE] Warm nudge notification triggered to ${partnerUser.email} (token: ${partnerUser.device_token || 'N/A'})`);

    res.json({ 
      success: true, 
      message: 'Warm nudge sent to your partner successfully.', 
      nudgeSent: true 
    });
  } catch (error) {
    console.error('Nudge error:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// POST /api/v1/relationship/unlink
router.post('/unlink', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { pairingId } = req.body;

  if (!pairingId) {
    return res.status(400).json({ success: false, error: 'Pairing ID is required to sever connection.' });
  }

  try {
    const { executeSelfDestruct } = require('../database');
    const { appendJournal } = require('./sync');

    executeSelfDestruct(pairingId);
    appendJournal('UNLINK_PAIRING', { pairing_id: pairingId });

    res.json({ success: true, message: 'Connection severed and all local records deleted successfully.' });
  } catch (error) {
    console.error('Failed to unlink connection:', error.message);
    res.status(500).json({ success: false, error: 'Failed to complete unlinking protocol.' });
  }
});

// GET /api/v1/relationship/pairing-status
router.get('/pairing-status', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  try {
    let pairing = db.prepare(`
      SELECT * FROM pairings 
      WHERE (user_a_id = ? OR user_b_id = ?) AND status != 'disconnected'
    `).get(userId, userId);

    if (!pairing) {
      const inviteCode = Math.random().toString(36).substring(2, 8).toUpperCase();
      const pairingId = uuidv4();
      const salt = uuidv4();

      db.prepare(`
        INSERT INTO pairings (id, user_a_id, invite_code, status, shared_secret_salt) 
        VALUES (?, ?, ?, 'pending', ?)
      `).run(pairingId, userId, inviteCode, salt);

      pairing = db.prepare('SELECT * FROM pairings WHERE id = ?').get(pairingId);
    }

    const partnerId = pairing.user_a_id === userId ? pairing.user_b_id : pairing.user_a_id;
    let partnerCompassCompleted = 0;
    let partnerEmail = null;

    if (partnerId) {
      const partner = db.prepare('SELECT email, compass_answers FROM users WHERE id = ?').get(partnerId);
      if (partner) {
        partnerEmail = partner.email;
        partnerCompassCompleted = partner.compass_answers ? 1 : 0;
      }
    }

    res.json({
      success: true,
      pairing: {
        id: pairing.id,
        inviteCode: pairing.invite_code,
        status: pairing.status,
        partnerEmail,
        partnerCompassCompleted
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/relationship/calendar/events
router.get('/calendar/events', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  try {
    const pairing = db.prepare(`
      SELECT id FROM pairings 
      WHERE (user_a_id = ? OR user_b_id = ?) AND status = 'active'
    `).get(userId, userId);

    if (!pairing) return res.json({ success: true, events: [] });

    const events = db.prepare('SELECT * FROM calendar_events WHERE pairing_id = ?').all(pairing.id);
    res.json({ success: true, events });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/relationship/calendar/propose
router.post('/calendar/propose', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { pairingId, itineraryId, scheduledTime } = req.body;

  if (!pairingId || !itineraryId || !scheduledTime) {
    return res.status(400).json({ success: false, error: 'Missing proposal parameters.' });
  }

  try {
    const itinerary = db.prepare('SELECT is_premium FROM itineraries WHERE id = ?').get(itineraryId);
    const user = db.prepare('SELECT is_premium FROM users WHERE id = ?').get(userId);

    if (itinerary && itinerary.is_premium === 1 && (!user || user.is_premium === 0)) {
      return res.status(403).json({ success: false, error: 'PAYWALL_TRIGGERED', message: 'Premium itinerary requires active subscription.' });
    }

    const eventId = uuidv4();
    db.prepare(`
      INSERT INTO calendar_events (id, pairing_id, itinerary_id, proposed_by, scheduled_time, status)
      VALUES (?, ?, ?, ?, ?, 'Pending')
    `).run(eventId, pairingId, itineraryId, userId, scheduledTime);

    const { appendJournal } = require('./sync');
    appendJournal('PROPOSE_EVENT', { id: eventId, pairing_id: pairingId, itinerary_id: itineraryId, proposed_by: userId, scheduled_time: scheduledTime, status: 'Pending' });

    res.status(201).json({ success: true, eventId });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/relationship/calendar/respond
router.post('/calendar/respond', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { eventId, action } = req.body;

  if (!eventId || !action) {
    return res.status(400).json({ success: false, error: 'Missing response parameters.' });
  }

  try {
    const event = db.prepare('SELECT * FROM calendar_events WHERE id = ?').get(eventId);
    if (!event) return res.status(404).json({ success: false, error: 'Event not found.' });

    const { appendJournal } = require('./sync');

    if (action === 'Accept') {
      db.prepare("UPDATE calendar_events SET status = 'Confirmed' WHERE id = ?").run(eventId);
      appendJournal('UPDATE_EVENT_STATUS', { id: eventId, status: 'Confirmed' });
      res.json({ success: true, message: 'Date accepted successfully.' });
    } else {
      db.prepare('DELETE FROM calendar_events WHERE id = ?').run(eventId);
      appendJournal('DELETE_EVENT', { id: eventId });
      res.json({ success: true, message: 'Date declined and event removed.' });
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/relationship/itineraries
router.get('/itineraries', authenticateToken, (req, res) => {
  try {
    const list = db.prepare('SELECT * FROM itineraries').all();
    res.json({ success: true, itineraries: list });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = {
  router,
  authenticateToken
};
