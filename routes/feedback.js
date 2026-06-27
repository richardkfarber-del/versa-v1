const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./relationship');
const { db, encryptText, hashDesireTag } = require('../database');
const { v4: uuidv4 } = require('uuid');

// POST /api/v1/feedback/ingest (Submit Afterglow survey)
router.post('/ingest', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { pairingId, safetyRating, arousalRating, connectionRating, notes, itineraryTags } = req.body;

  if (!pairingId || !safetyRating || !arousalRating || !connectionRating) {
    return res.status(400).json({ success: false, error: 'Missing survey rating parameters.' });
  }

  try {
    const surveyId = uuidv4();
    const encryptedNotes = notes ? encryptText(notes.trim()) : null;

    // 1. Insert into afterglow_surveys
    db.prepare(`
      INSERT INTO afterglow_surveys (id, pairing_id, user_id, safety_rating, arousal_rating, connection_rating, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(surveyId, pairingId, userId, safetyRating, arousalRating, connectionRating, encryptedNotes);

    // 2. Adaptive Safety Blacklisting Loop
    // If safety rating is 2 or lower, blacklist the associated itinerary tags immediately
    let blacklistedCount = 0;
    if (safetyRating <= 2 && itineraryTags && Array.isArray(itineraryTags)) {
      const insertBlacklist = db.prepare(`
        INSERT OR IGNORE INTO blacklisted_desires (id, user_id, desire_tag_hash) 
        VALUES (?, ?, ?)
      `);
      
      itineraryTags.forEach(tag => {
        if (tag && tag.trim()) {
          const hash = hashDesireTag(tag);
          insertBlacklist.run(uuidv4(), userId, hash);
          blacklistedCount++;
        }
      });
    }

    res.json({
      success: true,
      message: 'Feedback survey submitted successfully.',
      blacklistedTagsCount: blacklistedCount
    });
  } catch (error) {
    console.error('Failed to ingest feedback:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

module.exports = router;
