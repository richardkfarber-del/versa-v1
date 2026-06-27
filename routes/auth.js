const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const { db } = require('../database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'versa_secret_jwt_sign_key_991823';

// POST /api/v1/auth/register
router.post('/register', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    // Check if email already registered
    const existingUser = db.prepare('SELECT id FROM users WHERE email = ?').get(email.toLowerCase());
    if (existingUser) {
      return res.status(400).json({ success: false, error: 'Email already registered.' });
    }

    const userId = uuidv4();
    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Insert user
    db.prepare('INSERT INTO users (id, email, password_hash) VALUES (?, ?, ?)')
      .run(userId, email.toLowerCase(), passwordHash);

    const token = jwt.sign({ userId, email: email.toLowerCase() }, JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({
      success: true,
      token,
      user: { id: userId, email: email.toLowerCase(), hasCompassAnswers: false }
    });
  } catch (error) {
    console.error('Registration failed:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// POST /api/v1/auth/login
router.post('/login', (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required.' });
  }

  try {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email.toLowerCase());

    const genericError = 'Invalid email or password.';
    if (!user) {
      return res.status(401).json({ success: false, error: genericError });
    }

    const isValidPassword = bcrypt.compareSync(password, user.password_hash);
    if (!isValidPassword) {
      return res.status(401).json({ success: false, error: genericError });
    }

    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, { expiresIn: '7d' });

    res.json({
      success: true,
      token,
      user: { id: user.id, email: user.email, tonePreference: user.tone_preference, hasCompassAnswers: !!user.compass_answers }
    });
  } catch (error) {
    console.error('Login failed:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

module.exports = router;
