
const express = require('express');
const router = express.Router();
const QuizResponse = require('../models/quizResponse.cjs');
const { findBlindMatch } = require('../matchAlgorithm.cjs');

// Submit quiz answers
router.post('/submit', async (req, res) => {
  try {
    const { partnerId, answers } = req.body;
    const newResponse = new QuizResponse({ partnerId, answers });
    await newResponse.save();
    res.status(201).json({ success: true, message: 'Quiz response submitted successfully.' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Get match results
router.get('/match/:partnerA_Id/:partnerB_Id', async (req, res) => {
  try {
    const { partnerA_Id, partnerB_Id } = req.params;
    const result = await findBlindMatch(partnerA_Id, partnerB_Id);
    res.json(result);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
