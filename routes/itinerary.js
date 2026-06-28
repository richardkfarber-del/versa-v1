const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./relationship');
const { db, encryptText, decryptText, hashDesireTag } = require('../database');
const { v4: uuidv4 } = require('uuid');

const taskQueue = new Map();

// Static fallback date nights matching parameters
const preVettedItineraries = {
  Sensory: {
    title: "Somatic Shoulder Massage (The Slow Burn)",
    focus: "Sensory",
    duration: 15,
    steps: [
      { step: 1, title: "Transition and Breathe", instructions: "Sit comfortably opposite your partner. Place one hand on your heart and the other on your partner's heart. Synchronize your breathing for 3 minutes." },
      { step: 2, title: "Mindful Touch", instructions: "One partner gently massages the other's shoulders and neck using slow, rhythmic strokes. Switch after 5 minutes." },
      { step: 3, title: "Cozy Afterglow", instructions: "Rest in a comfortable embrace. Share one physical sensation you noticed during the touch." }
    ]
  },
  Verbal: {
    title: "Connection Compass Conversation",
    focus: "Verbal",
    duration: 15,
    steps: [
      { step: 1, title: "Eye Gazing", instructions: "Gaze into each other's eyes silently for 2 minutes, allowing your facial muscles to relax." },
      { step: 2, title: "Deep Prompts", instructions: "Take turns answering: 'What is one way you felt supported by me this past week?' spend 4 minutes each." },
      { step: 3, title: "Appreciation", instructions: "End by sharing three specific qualities you appreciate about your partner." }
    ]
  },
  Breathing: {
    title: "Nervous System Co-Regulation",
    focus: "Breathing",
    duration: 15,
    steps: [
      { step: 1, title: "4-4-6 Breath", instructions: "Inhale for 4 seconds, hold for 4 seconds, exhale for 6 seconds. Practice together for 5 minutes." },
      { step: 2, title: "Mirror Breath", instructions: "Mirror your partner's breathing pattern, matching the depth and rate of their inhales and exhales for 5 minutes." },
      { step: 3, title: "Rest and Reflect", instructions: "Lie down side by side in silence, focusing on the contact points of your bodies against the floor." }
    ]
  }
};

// POST /api/v1/itinerary/generate (Async queue)
router.post('/generate', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { pairingId, energyLevel, duration, focus } = req.body;

  if (!pairingId || !energyLevel || !duration || !focus) {
    return res.status(400).json({ success: false, error: 'Missing vibe check parameters.' });
  }

  const taskId = uuidv4();
  taskQueue.set(taskId, { status: 'pending', result: null, error: null });

  // Start background task
  generateItineraryTask(taskId, userId, pairingId, energyLevel, duration, focus);

  res.status(202).json({ success: true, taskId });
});

// GET /api/v1/itinerary/tasks/:id
router.get('/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const task = taskQueue.get(id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  res.json({ success: true, task });
});

// POST /api/v1/itinerary/active (Update active session countdown/state)
router.post('/active', authenticateToken, (req, res) => {
  const { pairingId, timerCountdown, sessionStatus, partnerAActive, partnerBActive, activeScriptId, lastEventTriggered } = req.body;

  if (!pairingId) {
    return res.status(400).json({ success: false, error: 'Pairing ID is required.' });
  }

  try {
    ensureMockPairingExists(pairingId);
    const exists = db.prepare('SELECT pairing_id FROM active_sessions WHERE pairing_id = ?').get(pairingId);
    if (!exists) {
      db.prepare(`
        INSERT INTO active_sessions (pairing_id, timer_countdown, session_status, last_event_triggered, active_script_id)
        VALUES (?, COALESCE(?, 900), COALESCE(?, 'Timer_Active'), COALESCE(?, 'INITIALIZED'), ?)
      `).run(pairingId, timerCountdown, sessionStatus, lastEventTriggered, activeScriptId);
    } else {
      db.prepare(`
        UPDATE active_sessions 
        SET timer_countdown = COALESCE(?, timer_countdown),
            session_status = COALESCE(?, session_status),
            partner_a_active = COALESCE(?, partner_a_active),
            partner_b_active = COALESCE(?, partner_b_active),
            active_script_id = COALESCE(?, active_script_id),
            last_event_triggered = COALESCE(?, last_event_triggered),
            updated_at = CURRENT_TIMESTAMP
        WHERE pairing_id = ?
      `).run(timerCountdown, sessionStatus, partnerAActive, partnerBActive, activeScriptId, lastEventTriggered, pairingId);
    }

    res.json({ success: true, message: 'Active session state updated successfully.' });
  } catch (error) {
    console.error('Failed to update active session:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// Background task worker
async function generateItineraryTask(taskId, userId, pairingId, energyLevel, duration, focus) {
  try {
    // 1. Fetch pairing partners
    const pairing = db.prepare('SELECT user_a_id, user_b_id FROM pairings WHERE id = ?').get(pairingId);
    if (!pairing) throw new Error('Pairing not found.');

    const partnerAId = pairing.user_a_id;
    const partnerBId = pairing.user_b_id;
    if (!partnerAId || !partnerBId) throw new Error('Both partners must be linked.');

    // 2. Fetch profiles
    const userA = db.prepare('SELECT email, compass_answers FROM users WHERE id = ?').get(partnerAId);
    const userB = db.prepare('SELECT email, compass_answers FROM users WHERE id = ?').get(partnerBId);

    const answersA = userA.compass_answers ? JSON.parse(decryptText(userA.compass_answers)) : {};
    const answersB = userB.compass_answers ? JSON.parse(decryptText(userB.compass_answers)) : {};

    // 3. Find overlapping Accelerators
    const accA = answersA.accelerators || [];
    const accB = answersB.accelerators || [];
    let overlap = accA.filter(x => accB.includes(x));

    // 4. Gather raw text boundaries for the scanner & negative constraints
    const boundariesA = answersA.boundaries || [];
    const boundariesB = answersB.boundaries || [];
    const rawBoundaries = [...new Set([...boundariesA, ...boundariesB])].filter(b => b.trim().length > 0);

    // 5. Blind index filtering: exclude any matching accelerators that are blacklisted
    // Filter accelerators whose hash is in either user's blacklist database table
    const nonBlacklistedOverlap = [];
    for (const tag of overlap) {
      const hash = hashDesireTag(tag);
      const isBlacklisted = db.prepare(`
        SELECT COUNT(*) as count FROM blacklisted_desires 
        WHERE (user_id = ? OR user_id = ?) AND desire_tag_hash = ?
      `).get(partnerAId, partnerBId, hash).count > 0;

      if (!isBlacklisted) {
        nonBlacklistedOverlap.push(tag);
      }
    }

    // 6. Build LLM prompt with negative constraints
    const systemPrompt = `
You are an expert, trauma-informed intimacy counselor.
Generate a custom, guided 3-interval date night script for a couple.
Vibe parameters:
- energy_level: ${energyLevel}
- duration: ${duration} minutes
- focus: ${focus}
- matched_themes: ${nonBlacklistedOverlap.join(', ') || 'general connection'}

CRITICAL SAFETY BOUNDARIES:
You MUST NOT suggest, mention, or describe anything relating to the following boundaries:
${rawBoundaries.map(b => `- ${b}`).join('\n') || 'None'}

Output strictly in a valid JSON object matching this schema:
{
  "title": "String",
  "steps": [
    { "step": 1, "title": "String", "instructions": "String" },
    { "step": 2, "title": "String", "instructions": "String" },
    { "step": 3, "title": "String", "instructions": "String" }
  ]
}

No markdown codeblocks, no conversational preamble. Strictly JSON.
`;

    let generatedJSONText = '';
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';

    try {
      console.log(`Starting local Ollama date night generation task: ${taskId}`);
      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:8b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: "Generate the itinerary JSON now." }
          ],
          options: {
            temperature: 0.7
          },
          stream: false
        })
      });

      if (!response.ok) throw new Error(`Ollama HTTP Error: ${response.status}`);
      const data = await response.json();
      generatedJSONText = data.message.content;
    } catch (ollamaErr) {
      console.warn(`Local Ollama date night generation failed (${ollamaErr.message}), routing to cloud fallback...`);
      generatedJSONText = await runCloudFallbackLLM(systemPrompt);
    }

    // 7. Clean JSON
    const cleanJSON = sanitizeJSONResponse(generatedJSONText);
    const itinerary = JSON.parse(cleanJSON);

    // 8. Dual-Layer Defense: Scan the output text for boundaries using RegEx
    const isSafe = runPostProcessScanner(itinerary, rawBoundaries);

    if (!isSafe) {
      console.warn("Boundary violation detected by post-processing scanner! Loading pre-vetted static fallback.");
      const fallback = loadPreVettedFallback(focus);
      saveItineraryToSession(pairingId, fallback, duration);
      taskQueue.set(taskId, { status: 'completed', result: fallback, error: 'Boundary violation triggered safe fallback' });
    } else {
      saveItineraryToSession(pairingId, itinerary, duration);
      taskQueue.set(taskId, { status: 'completed', result: itinerary, error: null });
    }

  } catch (error) {
    console.error(`Date night generation task ${taskId} failed:`, error.message);
    const fallback = loadPreVettedFallback(focus);
    saveItineraryToSession(pairingId, fallback, duration);
    taskQueue.set(taskId, { status: 'completed', result: fallback, error: `LLM error: ${error.message}. Fallback loaded.` });
  }
}

// Fallback cloud LLM
async function runCloudFallbackLLM(systemPrompt) {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.SUPABASE_ANON_KEY;
  if (!geminiApiKey) {
    throw new Error('No cloud API key configured for fallback.');
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`;
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          role: 'user',
          parts: [{ text: systemPrompt }]
        }
      ],
      generationConfig: {
        responseMimeType: "application/json"
      }
    })
  });

  if (!response.ok) {
    throw new Error(`Cloud Gemini API returned status: ${response.status}`);
  }

  const resJson = await response.json();
  return resJson.candidates[0].content.parts[0].text;
}

// Post-generation boundary scanner (Case-insensitive keyword/Regex scan)
function runPostProcessScanner(itinerary, rawBoundaries) {
  if (!rawBoundaries || rawBoundaries.length === 0) return true;

  const textToScan = [
    itinerary.title || '',
    ...(itinerary.steps || []).map(s => `${s.title} ${s.instructions}`)
  ].join(' ').toLowerCase();

  for (const boundary of rawBoundaries) {
    const cleanBoundary = boundary.trim().toLowerCase();
    if (!cleanBoundary) continue;

    // Strict boundary keyword match
    if (textToScan.includes(cleanBoundary)) {
      return false; // Boundary violated
    }

    // RegEx match for safety
    try {
      const regex = new RegExp(`\\b${cleanBoundary}\\w*\\b`, 'i');
      if (regex.test(textToScan)) {
        return false; // Boundary matched
      }
    } catch (e) {
      // RegEx fail safety
    }
  }

  return true;
}

function loadPreVettedFallback(focus) {
  return preVettedItineraries[focus] || preVettedItineraries.Breathing;
}

function ensureMockPairingExists(pairingId) {
  const exists = db.prepare('SELECT id FROM pairings WHERE id = ?').get(pairingId);
  if (!exists) {
    db.prepare(`
      INSERT OR IGNORE INTO pairings (id, user_a_id, user_b_id, status)
      VALUES (?, NULL, NULL, 'active')
    `).run(pairingId);
  }
}

function saveItineraryToSession(pairingId, itinerary, durationMinutes) {
  const scriptJSON = JSON.stringify(itinerary);
  ensureMockPairingExists(pairingId);
  const durationVal = parseInt(durationMinutes, 10);
  const countdownSeconds = (!isNaN(durationVal) && durationVal > 0) ? durationVal * 60 : 900;
  const exists = db.prepare('SELECT pairing_id FROM active_sessions WHERE pairing_id = ?').get(pairingId);
  if (!exists) {
    db.prepare(`
      INSERT INTO active_sessions (pairing_id, active_script_id, timer_countdown, session_status, last_event_triggered)
      VALUES (?, ?, ?, 'Timer_Active', 'NEW_ITINERARY_GENERATED')
    `).run(pairingId, scriptJSON, countdownSeconds);
  } else {
    db.prepare(`
      UPDATE active_sessions 
      SET active_script_id = ?,
          timer_countdown = ?,
          session_status = 'Timer_Active',
          last_event_triggered = 'NEW_ITINERARY_GENERATED',
          updated_at = CURRENT_TIMESTAMP
      WHERE pairing_id = ?
    `).run(scriptJSON, countdownSeconds, pairingId);
  }
}

function sanitizeJSONResponse(text) {
  let clean = text.trim();
  if (clean.startsWith('```json')) {
    clean = clean.substring(7);
  } else if (clean.startsWith('```')) {
    clean = clean.substring(3);
  }
  if (clean.endsWith('```')) {
    clean = clean.substring(0, clean.length - 3);
  }
  return clean.trim();
}

// Background database timer ticker
setInterval(() => {
  try {
    const activeSessions = db.prepare("SELECT pairing_id, timer_countdown FROM active_sessions WHERE session_status = 'Timer_Active'").all();
    
    const updateTick = db.prepare("UPDATE active_sessions SET timer_countdown = ?, updated_at = CURRENT_TIMESTAMP WHERE pairing_id = ?");
    const finishSession = db.prepare("UPDATE active_sessions SET session_status = 'Finished', timer_countdown = 0, last_event_triggered = 'TIMER_EXPIRED', updated_at = CURRENT_TIMESTAMP WHERE pairing_id = ?");

    activeSessions.forEach(session => {
      const nextTime = session.timer_countdown - 1;
      if (nextTime <= 0) {
        finishSession.run(session.pairing_id);
      } else {
        updateTick.run(nextTime, session.pairing_id);
      }
    });
  } catch (err) {
    // Avoid crashing background process on database lock or timeout
  }
}, 1000);

module.exports = router;
