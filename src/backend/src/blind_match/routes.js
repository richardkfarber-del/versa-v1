const express = require('express');
const router = express.Router();
const { calculateMatch } = require('./matchEngine');

// Mock database for MVP
const userAnswersDB = {}; // sessionId -> { partnerA: [], partnerB: [] }

// Middleware to verify session and partner (stubbed for MVP-BE-001 integration)
const requireSession = (req, res, next) => {
  req.sessionId = req.headers['x-session-id'] || 'demo-session';
  req.partnerId = req.headers['x-partner-id'] || 'partnerA';
  next();
};

/**
 * POST /api/blind-match/submit
 * Submits a partner's quiz answers securely.
 */
router.post('/submit', requireSession, (req, res) => {
  const { sessionId, partnerId } = req;
  const { answers } = req.body;

  if (!answers || !Array.isArray(answers)) {
    return res.status(400).json({ error: 'Invalid answers format' });
  }

  if (!userAnswersDB[sessionId]) {
    userAnswersDB[sessionId] = { partnerA: [], partnerB: [] };
  }

  userAnswersDB[sessionId][partnerId] = answers;

  res.status(200).json({ message: 'Answers submitted securely.' });
});

/**
 * GET /api/blind-match/results
 * Retrieves strictly the overlapping 'Yes'/'Maybe' answers.
 */
router.get('/results', requireSession, (req, res) => {
  const { sessionId } = req;
  const sessionData = userAnswersDB[sessionId];

  if (!sessionData || sessionData.partnerA.length === 0 || sessionData.partnerB.length === 0) {
    return res.status(200).json({ status: 'pending', message: 'Waiting for both partners to complete the quiz.' });
  }

  // Calculate the strict intersection
  const matchResults = calculateMatch(sessionData.partnerA, sessionData.partnerB);

  // Return ONLY the matched data
  res.status(200).json({ 
    status: 'complete',
    matches: matchResults 
  });
});

module.exports = router;
