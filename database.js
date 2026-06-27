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
    FOREIGN KEY(pairing_id) REFERENCES active_sessions(pairing_id) ON DELETE CASCADE,
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
`);

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

module.exports = {
  db,
  encryptText,
  decryptText,
  hashDesireTag
};
