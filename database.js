const Database = require('better-sqlite3');
const path = require('path');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

const dbPath = path.resolve(__dirname, 'versa.db');
const db = new Database(dbPath);

// Enable foreign keys
db.pragma('foreign_keys = ON');

// Initialize database schema
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    public_key TEXT,
    compass_answers TEXT,
    tone_preference TEXT DEFAULT 'warm',
    is_premium INTEGER DEFAULT 0,
    device_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS pairings (
    id TEXT PRIMARY KEY,
    user_a_id TEXT,
    user_b_id TEXT,
    invite_code TEXT UNIQUE,
    status TEXT DEFAULT 'pending',
    shared_secret_salt TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_a_id) REFERENCES users(id) ON DELETE SET NULL,
    FOREIGN KEY(user_b_id) REFERENCES users(id) ON DELETE SET NULL
  );

  CREATE TABLE IF NOT EXISTS active_sessions (
    pairing_id TEXT PRIMARY KEY,
    timer_countdown INTEGER DEFAULT 900,
    session_status TEXT DEFAULT 'Timer_Active',
    partner_a_active INTEGER DEFAULT 0,
    partner_b_active INTEGER DEFAULT 0,
    active_script_id TEXT,
    last_event_triggered TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(pairing_id) REFERENCES pairings(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS blacklisted_desires (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    desire_tag_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, desire_tag_hash)
  );

  CREATE TABLE IF NOT EXISTS afterglow_surveys (
    id TEXT PRIMARY KEY,
    pairing_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    safety_rating INTEGER CHECK(safety_rating >= 1 AND safety_rating <= 5),
    arousal_rating INTEGER CHECK(arousal_rating >= 1 AND arousal_rating <= 5),
    connection_rating INTEGER CHECK(connection_rating >= 1 AND connection_rating <= 5),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(pairing_id) REFERENCES pairings(id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS affiliate_products (
    id TEXT PRIMARY KEY,
    desire_tag_hash TEXT NOT NULL,
    product_name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    affiliate_url TEXT NOT NULL,
    rating REAL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS compass_questions (
    id TEXT PRIMARY KEY,
    text TEXT NOT NULL,
    category TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS itineraries (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    steps TEXT,
    is_premium INTEGER DEFAULT 0,
    tags TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS calendar_events (
    id TEXT PRIMARY KEY,
    pairing_id TEXT NOT NULL,
    itinerary_id TEXT NOT NULL,
    proposed_by TEXT NOT NULL,
    scheduled_time TEXT NOT NULL,
    status TEXT DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(pairing_id) REFERENCES pairings(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS ai_cache (
    id TEXT PRIMARY KEY,
    input_hash TEXT NOT NULL UNIQUE,
    prompt_type TEXT NOT NULL,
    response_text TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    invalidated INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS sync_metadata (
    id TEXT PRIMARY KEY,
    last_sync_time TIMESTAMP,
    last_sync_status TEXT,
    local_commit_hash TEXT,
    remote_commit_hash TEXT
  );

  CREATE TABLE IF NOT EXISTS admins (
    id TEXT PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role TEXT DEFAULT 'editor',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );
`);

try { db.exec("ALTER TABLE users ADD COLUMN is_premium INTEGER DEFAULT 0"); } catch (e) {}
try { db.exec("ALTER TABLE users ADD COLUMN device_token TEXT"); } catch (e) {}

// Encryption keys
const DATABASE_KEY = process.env.DATABASE_KEY || 'default_sec_db_key_32_characters';
const AFFILIATE_HASH_KEY = process.env.AFFILIATE_HASH_KEY || 'default_affiliate_salt_key';

// Ensure keys meet requirements
const dbKeyBuffer = Buffer.alloc(32);
Buffer.from(DATABASE_KEY).copy(dbKeyBuffer);

function encryptText(text) {
  if (!text) return text;
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', dbKeyBuffer, iv);
  let encrypted = cipher.update(text, 'utf8');
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decryptText(text) {
  if (!text) return text;
  try {
    const parts = text.split(':');
    if (parts.length < 2) return text;
    const iv = Buffer.from(parts.shift(), 'hex');
    const encryptedText = Buffer.from(parts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', dbKeyBuffer, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString('utf8');
  } catch (error) {
    console.error("Decryption failed:", error.message);
    return text;
  }
}

function hashDesireTag(tag) {
  if (!tag) return tag;
  return crypto
    .createHmac('sha256', AFFILIATE_HASH_KEY)
    .update(tag.trim().toLowerCase())
    .digest('hex');
}

// Seed helper data if empty
const questionCount = db.prepare('SELECT COUNT(*) as count FROM compass_questions').get().count;
if (questionCount === 0) {
  const seedQuestions = [
    { text: "I'm interested in trying a massage with my partner.", category: "Accelerators" },
    { text: "I would like to explore deeper conversation prompts.", category: "Accelerators" },
    { text: "I'm curious about temperature play (e.g., ice, massage candles).", category: "Accelerators" },
    { text: "I hate blindfolds or sensory restriction.", category: "Boundaries" },
    { text: "I get tense after work and need physical touch to unwind.", category: "Accelerators" },
    { text: "Work stress and exhaustion make it hard to focus on intimacy.", category: "Brakes" }
  ];

  const insertQuestion = db.prepare('INSERT INTO compass_questions (id, text, category) VALUES (?, ?, ?)');
  seedQuestions.forEach(q => {
    insertQuestion.run(uuidv4(), q.text, q.category);
  });
  console.log("Seeded default compass questions.");
}

const productCount = db.prepare('SELECT COUNT(*) as count FROM affiliate_products').get().count;
if (productCount === 0) {
  const seedProducts = [
    { tag: "massage", name: "Organic Lavender Massage Oil", brand: "SomaTherapy", url: "https://example.com/massage-oil" },
    { tag: "temperature play", name: "Soy Wax Warming Massage Candle", brand: "FlameIntimacy", url: "https://example.com/warming-candle" }
  ];

  const insertProduct = db.prepare('INSERT INTO affiliate_products (id, desire_tag_hash, product_name, brand_name, affiliate_url) VALUES (?, ?, ?, ?, ?)');
  seedProducts.forEach(p => {
    insertProduct.run(uuidv4(), hashDesireTag(p.tag), p.name, p.brand, p.url);
  });
  console.log("Seeded default affiliate products.");
}

// Seed default intimacy itineraries
const itineraryCount = db.prepare('SELECT COUNT(*) as count FROM itineraries').get().count;
if (itineraryCount === 0) {
  const seedItineraries = [
    {
      id: "itinerary-conversation",
      title: "Deep Conversation",
      description: "Explore the unsaid with guided prompts for intimacy.",
      steps: JSON.stringify([
        { step: 1, title: "Warmup Sharing", instructions: "Share one small stressor from your day and immediately let it go." },
        { step: 2, title: "Vulnerable Inquiry", instructions: "Ask your partner: 'What is a soft boundary of mine that you appreciate?'" },
        { step: 3, title: "Silent Appreciation", instructions: "Hold eye contact for 2 minutes without speaking." }
      ]),
      is_premium: 0,
      tags: "verbal,low-energy,onboarding"
    },
    {
      id: "itinerary-massage",
      title: "15-Minute Massage",
      description: "A gentle tactile exchange to release physical tension.",
      steps: JSON.stringify([
        { step: 1, title: "Shoulder Release", instructions: "Spend 5 minutes massaging your partner's shoulders with warm lavender oil." },
        { step: 2, title: "Neck Release", instructions: "Spend 5 minutes focusing on the back of their neck using soft, circular strokes." },
        { step: 3, title: "Gratitude Whisper", instructions: "Whisper one detail you love about their presence." }
      ]),
      is_premium: 1,
      tags: "somatic,tactile,premium"
    },
    {
      id: "itinerary-breathwork",
      title: "Slow Breathwork",
      description: "Synchronized breathing to align your nervous systems.",
      steps: JSON.stringify([
        { step: 1, title: "Align Postures", instructions: "Sit cross-legged facing each other, touching knees." },
        { step: 2, title: "Synchronize Breath", instructions: "Breathe in for 4 seconds, hold for 4, exhale for 4. Match your partner's rhythm." },
        { step: 3, title: "Co-Regulation Rest", instructions: "Place your hand on your partner's heart and close your eyes together." }
      ]),
      is_premium: 0,
      tags: "breathing,calm,regulation"
    }
  ];

  const insertItinerary = db.prepare('INSERT INTO itineraries (id, title, description, steps, is_premium, tags) VALUES (?, ?, ?, ?, ?, ?)');
  seedItineraries.forEach(it => {
    insertItinerary.run(it.id, it.title, it.description, it.steps, it.is_premium, it.tags);
  });
  console.log("Seeded default intimacy itineraries.");
}

// Self-destruct unlinking logic via pairings deletion (cascades automatically)
function executeSelfDestruct(pairingId) {
  try {
    const deleteTx = db.transaction(() => {
      // 1. Delete parent pairings row. ON DELETE CASCADE will handle active_sessions, calendar_events, afterglow_surveys, etc.
      db.prepare('DELETE FROM pairings WHERE id = ?').run(pairingId);
      // 2. Nullify pairing link details on the users
      db.prepare("UPDATE users SET pairing_id = NULL WHERE pairing_id = ?").run(pairingId);
    });
    deleteTx();
    console.log(`Self-Destruct pairing deletion cascade complete for pairing ID: ${pairingId}`);
    return true;
  } catch (error) {
    console.error('Failed to complete self-destruct pairing unlinking:', error.message);
    throw error;
  }
}

module.exports = {
  db,
  encryptText,
  decryptText,
  hashDesireTag,
  executeSelfDestruct
};
