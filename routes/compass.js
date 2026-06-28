const express = require('express');
const router = express.Router();
const { authenticateToken } = require('./relationship');
const { db, encryptText, decryptText, hashDesireTag } = require('../database');
const { v4: uuidv4 } = require('uuid');

// In-memory task queue
const taskQueue = new Map();

// POST /api/v1/compass/chat
router.post('/chat', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  const { transcript } = req.body;

  if (!transcript || transcript.trim().length === 0) {
    return res.status(400).json({ success: false, error: 'Transcript content is required.' });
  }

  try {
    const user = db.prepare('SELECT compass_step, compass_transcript FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User profile not found.' });
    }

    const currentStep = user.compass_step || 1;
    let accumulatedTranscript = user.compass_transcript || '';

    // Append current turn
    accumulatedTranscript = (accumulatedTranscript + '\n' + transcript.trim()).trim();

    if (currentStep === 1) {
      db.prepare('UPDATE users SET compass_step = 2, compass_transcript = ? WHERE id = ?')
        .run(accumulatedTranscript, userId);

      return res.json({
        success: true,
        isCompleted: false,
        nextQuestion: "Thank you. Let's look at sensory elements next: Are you curious about temperature play (e.g. ice, warming massage candles)? And do you have any strict boundaries, such as sensory restriction or blindfolds, that we should always avoid?"
      });
    } else if (currentStep === 2) {
      db.prepare('UPDATE users SET compass_step = 3, compass_transcript = ? WHERE id = ?')
        .run(accumulatedTranscript, userId);

      return res.json({
        success: true,
        isCompleted: false,
        nextQuestion: "Understood. Lastly, let's explore timing and fatigue: Do you tend to feel tense after work and need physical touch to unwind? And do work stress and exhaustion ever feel like a brake to your intimacy?"
      });
    } else {
      db.prepare('UPDATE users SET compass_step = 4, compass_transcript = ? WHERE id = ?')
        .run(accumulatedTranscript, userId);

      const taskId = uuidv4();
      taskQueue.set(taskId, { status: 'pending', result: null, error: null });

      runLLMExtraction(taskId, userId, accumulatedTranscript);

      return res.status(202).json({
        success: true,
        isCompleted: true,
        taskId
      });
    }
  } catch (error) {
    console.error('Compass chat step progression failure:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// GET /api/v1/tasks/:id (Polling task status)
router.get('/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const task = taskQueue.get(id);

  if (!task) {
    return res.status(404).json({ success: false, error: 'Task not found.' });
  }

  res.json({ success: true, task });
});

// GET /api/v1/compass/profile (Get user profile data)
router.get('/profile', authenticateToken, (req, res) => {
  const userId = req.user.userId;
  try {
    const user = db.prepare('SELECT compass_answers, tone_preference, compass_step FROM users WHERE id = ?').get(userId);
    if (!user) {
      return res.status(404).json({ success: false, error: 'User not found.' });
    }

    const decryptedAnswers = user.compass_answers ? JSON.parse(decryptText(user.compass_answers)) : null;

    res.json({
      success: true,
      profile: {
        tonePreference: user.tone_preference,
        compassAnswers: decryptedAnswers,
        compassStep: user.compass_step || 1
      }
    });
  } catch (error) {
    console.error('Failed to retrieve profile:', error.message);
    res.status(500).json({ success: false, error: 'Internal Server Error.' });
  }
});

// Asynchronous background extraction worker
async function runLLMExtraction(taskId, userId, transcript) {
  try {
    // 1. Fetch existing user profile
    const user = db.prepare('SELECT compass_answers FROM users WHERE id = ?').get(userId);
    const existingAnswers = user && user.compass_answers ? decryptText(user.compass_answers) : '{}';

    // 2. Build system prompt (trauma-informed intimacy entity extraction)
    const systemPrompt = `
You are an expert, trauma-informed intimacy profiler.
Analyze the raw transcript of the user's conversational onboarding.
Extract the following attributes and output STRICTLY in a valid JSON object:
- brakes: list of strings (triggers, physical fatigue cues, stressors)
- accelerators: list of strings (sensory preferences, intimacy cues, connection enhancers)
- boundaries: list of strings (strict off-limit sensory inputs, BDSM triggers, or activities)
- tone_preference: one of "clinical", "romantic", or "warm"

Merge these extractions cleanly with the existing profile JSON: ${existingAnswers}.

CRITICAL:
1. Do NOT suggest or generate any boundaries or desires yourself. Extract only what is explicitly in the transcript.
2. Output ONLY the final JSON object. Do NOT include markdown codeblocks (e.g. \`\`\`json), conversational preamble, or explanations.
`;

    let llmResponseText = '';
    const ollamaHost = process.env.OLLAMA_HOST || 'http://localhost:11434';

    try {
      console.log(`Starting local Ollama llama3:8b extraction task: ${taskId}`);
      const response = await fetch(`${ollamaHost}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'llama3:8b',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Analyze this transcript: "${transcript}"` }
          ],
          options: {
            temperature: 0.1 // Keep it deterministic
          },
          stream: false
        })
      });

      if (!response.ok) throw new Error(`Ollama HTTP Error: ${response.status}`);
      const data = await response.json();
      llmResponseText = data.message.content;
    } catch (ollamaErr) {
      console.warn(`Local Ollama extraction failed (${ollamaErr.message}), routing to cloud fallback API...`);
      try {
        llmResponseText = await runCloudFallbackLLM(systemPrompt, transcript);
      } catch (cloudErr) {
        console.warn(`Cloud fallback failed: ${cloudErr.message}. Executing rule-based parsing engine fallback...`);
        const lowerText = transcript.toLowerCase();
        const accelerators = [];
        const boundaries = [];
        const brakes = [];
        
        if (lowerText.includes('massage') || lowerText.includes('touch') || lowerText.includes('somatic')) {
          accelerators.push('massage');
        }
        if (lowerText.includes('conversation') || lowerText.includes('talk') || lowerText.includes('verbal')) {
          accelerators.push('conversation');
        }
        if (lowerText.includes('breath') || lowerText.includes('calm') || lowerText.includes('regulation') || lowerText.includes('breathing')) {
          accelerators.push('breathwork');
        }
        if (lowerText.includes('blindfold') || lowerText.includes('sensory restriction')) {
          boundaries.push('blindfolds');
        }
        if (lowerText.includes('stress') || lowerText.includes('fatigue') || lowerText.includes('work')) {
          brakes.push('fatigue');
        }

        llmResponseText = JSON.stringify({
          brakes: brakes.length > 0 ? brakes : ['work fatigue'],
          accelerators: accelerators.length > 0 ? accelerators : ['conversation', 'massage'],
          boundaries: boundaries.length > 0 ? boundaries : [],
          tone_preference: 'warm'
        });
      }
    }

    // 3. Clean and parse JSON response
    const cleanJSON = sanitizeJSONResponse(llmResponseText);
    const parsedData = JSON.parse(cleanJSON);

    // 4. Update the user record
    const encryptedJSON = encryptText(JSON.stringify(parsedData));
    const tonePreference = parsedData.tone_preference || 'warm';

    db.prepare('UPDATE users SET compass_answers = ?, tone_preference = ? WHERE id = ?')
      .run(encryptedJSON, tonePreference, userId);

    // 5. Ingest boundaries under blind indexing
    if (parsedData.boundaries && Array.isArray(parsedData.boundaries)) {
      const insertBoundary = db.prepare(`
        INSERT OR IGNORE INTO blacklisted_desires (id, user_id, desire_tag_hash) 
        VALUES (?, ?, ?)
      `);
      parsedData.boundaries.forEach(boundary => {
        if (boundary.trim()) {
          const hash = hashDesireTag(boundary);
          insertBoundary.run(uuidv4(), userId, hash);
        }
      });
    }

    taskQueue.set(taskId, { status: 'completed', result: parsedData, error: null });
    console.log(`Task ${taskId} completed successfully.`);
  } catch (error) {
    console.error(`Task ${taskId} failed:`, error.message);
    taskQueue.set(taskId, { status: 'error', result: null, error: error.message });
  }
}

// Fallback cloud LLM router (Gemini API)
async function runCloudFallbackLLM(systemPrompt, transcript) {
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
          parts: [{ text: `${systemPrompt}\n\nAnalyze this transcript: "${transcript}"` }]
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
  const text = resJson.candidates[0].content.parts[0].text;
  return text;
}

// Strips markdown json codeblock styling and clean LLM responses
function sanitizeJSONResponse(text) {
  let clean = text.trim();
  // Strip ```json and ``` codeblocks
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

module.exports = router;
