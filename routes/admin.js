const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
const { appendJournal } = require('./sync');

const ADMIN_JWT_SECRET = process.env.ADMIN_JWT_SECRET || 'versa_secret_admin_sign_key_993821';

// Admin Authentication Middleware
function authenticateAdminToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ success: false, error: 'Admin access token required.' });

  jwt.verify(token, ADMIN_JWT_SECRET, (err, admin) => {
    if (err) return res.status(403).json({ success: false, error: 'Invalid or expired admin token.' });
    req.admin = admin;
    next();
  });
}

// POST /api/v1/admin/register
router.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const hash = bcrypt.hashSync(password, 10);
    const id = uuidv4();
    db.prepare('INSERT INTO admins (id, email, password_hash) VALUES (?, ?, ?)').run(id, email, hash);
    res.status(201).json({ success: true, message: 'Admin account registered successfully.' });
  } catch (error) {
    console.error('Admin registration error:', error.message);
    res.status(400).json({ success: false, error: 'Admin registration failed (email might be in use).' });
  }
});

// POST /api/v1/admin/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(email);
    if (!admin || !bcrypt.compareSync(password, admin.password_hash)) {
      return res.status(401).json({ success: false, error: 'Invalid admin credentials.' });
    }

    const token = jwt.sign({ adminId: admin.id, email: admin.email, role: admin.role }, ADMIN_JWT_SECRET, { expiresIn: '2h' });
    res.json({ success: true, token });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/admin/itineraries (Add content)
router.post('/itineraries', authenticateAdminToken, (req, res) => {
  const { title, description, steps, isPremium, tags } = req.body;
  if (!title || !steps) {
    return res.status(400).json({ success: false, error: 'Title and steps are required.' });
  }

  try {
    const id = uuidv4();
    const isPremVal = isPremium ? 1 : 0;
    const stepsStr = typeof steps === 'string' ? steps : JSON.stringify(steps);

    db.prepare(`
      INSERT INTO itineraries (id, title, description, steps, is_premium, tags)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(id, title, description || '', stepsStr, isPremVal, tags || '');

    // Write to collaborative sync journal
    appendJournal('ADD_ITINERARY', { id, title, description, steps: stepsStr, is_premium: isPremVal, tags });

    res.status(201).json({ success: true, itineraryId: id });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET /api/v1/admin/itineraries (List content)
router.get('/itineraries', authenticateAdminToken, (req, res) => {
  try {
    const itineraries = db.prepare('SELECT * FROM itineraries ORDER BY created_at DESC').all();
    res.json({ success: true, itineraries });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/admin/itineraries/toggle-premium (Toggle status)
router.post('/itineraries/toggle-premium', authenticateAdminToken, (req, res) => {
  const { id } = req.body;
  if (!id) return res.status(400).json({ success: false, error: 'Itinerary ID is required.' });

  try {
    const current = db.prepare('SELECT is_premium FROM itineraries WHERE id = ?').get(id);
    if (!current) return res.status(404).json({ success: false, error: 'Itinerary not found.' });

    const nextState = current.is_premium === 1 ? 0 : 1;
    db.prepare('UPDATE itineraries SET is_premium = ? WHERE id = ?').run(nextState, id);
    res.json({ success: true, isPremium: nextState });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// POST /api/v1/admin/cache/invalidate (Clear prompt cache)
router.post('/cache/invalidate', authenticateAdminToken, (req, res) => {
  try {
    db.prepare('UPDATE ai_cache SET invalidated = 1').run();
    res.json({ success: true, message: 'AI prompt cache invalidated successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = {
  router,
  authenticateAdminToken
};
