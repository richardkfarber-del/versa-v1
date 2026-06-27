# **Versa — Technical Specification (Phase II: AI Concierge & Real-Time Sync Expansion)**

# **1\. Architectural Overview & Technical Stack**

Versa Phase II maintains a strict, local-first hybrid architecture to ensure complete user privacy, data sovereignty, and responsive execution while utilizing a managed cloud sync framework for real-time partner linking.

* **Frontend:** React 19 (TypeScript, Vite, Tailwind CSS). Includes sliding side drawers (Settings, Partner Pairing Panel), SVG Lottie animations for somatic co-regulation guides, and dynamic slider inputs for Vibe Checks.  
* **Backend:** Node.js, Express.js. Serves as the local desktop middleware for handling LLM prompting pipelines, SQLite database operations, and outbound affiliate encryption.  
* **Local AI Engine:** Ollama running locally. Programmatically triggered on launch.  
  * `llama3:8b` for conversational desire extraction, dynamic Vibe-Check date-night generation, and afterglow feedback processing.  
  * `nomic-embed-text` for generating local text-based vectors for semantic blacklisting.  
* **Real-Time Synchronization:** Supabase Realtime Client JS SDK. Links Partner A and Partner B devices under a shared pair ID, managing active session countdowns and executing the co-regulation emergency brake event.  
* **Database & Vector Store:** SQLite (`better-sqlite3`) executing locally on the host machine.  
  * **Relational Database:** Handles user profiles, pairings metadata, pre-flight checklists, completed date metrics, and feedback.  
  * **Encrypted Store:** Important desire strings and transcripts are encrypted locally using AES-256 before write operations.

# **2\. Database Schema Extensions (SQLite)**

To support the AI Concierge and Real-time sync mechanisms, the local relational database schema is extended with the following table definitions using UUID keys (TEXT) and deterministic blind indexing hashes:

-- Extend users table to hold AI quiz extractions and preferred vocabulary styles
ALTER TABLE users ADD COLUMN compass_answers TEXT; -- Encrypted JSON string
ALTER TABLE users ADD COLUMN tone_preference TEXT DEFAULT 'warm'; -- clinical, romantic, warm

-- Active Sync Sessions table (mirrored to Supabase Realtime DB state)
CREATE TABLE IF NOT EXISTS active_sessions (
    pairing_id TEXT PRIMARY KEY, -- UUID (TEXT)
    timer_countdown INTEGER DEFAULT 900,
    session_status TEXT DEFAULT 'Timer_Active', -- 'Timer_Active', 'Paused', 'Grounding'
    partner_a_active INTEGER DEFAULT 0,
    partner_b_active INTEGER DEFAULT 0,
    active_script_id TEXT,
    last_event_triggered TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Blacklisted Desires / Boundary checkstop table
CREATE TABLE IF NOT EXISTS blacklisted_desires (
    id TEXT PRIMARY KEY, -- UUID (TEXT)
    user_id TEXT NOT NULL,
    desire_tag_hash TEXT NOT NULL, -- SHA-256 blind index hash
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, desire_tag_hash)
);

-- Post-Date "Afterglow" Feedback Survey table
CREATE TABLE IF NOT EXISTS afterglow_surveys (
    id TEXT PRIMARY KEY, -- UUID (TEXT)
    pairing_id TEXT NOT NULL, -- UUID (TEXT)
    user_id TEXT NOT NULL, -- UUID (TEXT)
    safety_rating INTEGER CHECK(safety_rating >= 1 AND safety_rating <= 5),
    arousal_rating INTEGER CHECK(arousal_rating >= 1 AND arousal_rating <= 5),
    connection_rating INTEGER CHECK(connection_rating >= 1 AND connection_rating <= 5),
    notes TEXT, -- Encrypted open text
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(pairing_id) REFERENCES active_sessions(pairing_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Affiliate Products Sourcing catalog
CREATE TABLE IF NOT EXISTS affiliate_products (
    id TEXT PRIMARY KEY, -- UUID (TEXT)
    desire_tag_hash TEXT NOT NULL, -- SHA-256 blind index hash
    product_name TEXT NOT NULL,
    brand_name TEXT NOT NULL,
    affiliate_url TEXT NOT NULL,
    rating REAL,
    image_url TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

# **3. Supabase Real-Time Sync & State Machine Logic**

To guarantee multi-device timer synchronization that survives disconnects and page reloads, timer states and active session countdown variables are persisted in the database. The Express backend and clients use the Supabase JS SDK client to listen for real-time Postgres table replication updates:

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Subscribe to replicated database updates for a specific pairing's active session
export function subscribeToSession(pairingId: string, onUpdate: (payload: any) => void) {
  const channel = supabase
    .channel(`active_sessions_sync:${pairingId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'active_sessions',
        filter: `pairing_id=eq.${pairingId}`
      },
      (payload) => {
        onUpdate(payload.new);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        console.log(`Successfully listening for active_sessions updates: ${pairingId}`);
      }
    });

  return channel;
}

// On reconnect, clients perform a REST check-in to fetch the persisted state
export async function fetchCurrentSessionState(pairingId: string) {
  const { data, error } = await supabase
    .from('active_sessions')
    .select('*')
    .eq('pairing_id', pairingId)
    .single();
  if (error) throw error;
  return data;
}

// Red light emergency brake updates the database, automatically replicating to partners
export async function triggerRedLight(pairingId: string) {
  const { data, error } = await supabase
    .from('active_sessions')
    .update({
      session_status: 'Grounding',
      last_event_triggered: 'RED_LIGHT_TRIGGERED',
      timer_countdown: 0
    })
    .eq('pairing_id', pairingId);
  if (error) throw error;
  return data;
}

# **4\. Conversational AI Extraction Engine**

The Conversational Compass chat engine utilizes the local Ollama instance's REST endpoint (`POST http://localhost:11434/api/chat`) to perform entity extraction:import axios from 'axios';

export async function extractDesiresFromTranscript(transcript: string, existingAnswers: string) {

  const systemPrompt \= \`

    You are an expert, trauma-informed intimacy profiler.

    Analyze the raw transcript of the user's conversational onboarding.

    Extract the following attributes and output strictly in valid JSON:

    \- Brakes: Triggers, physical fatigue cues, stressors.

    \- Accelerators: Sensory preferences, intimacy cues, connection enhancers.

    \- Boundaries: Strict off-limit sensory inputs or activities.

    \- Tone: clinical, romantic, or warm.

    

    Merge these extractions cleanly with the existing profile JSON: ${existingAnswers}.

    Do NOT include any markdown, markdown codeblocks, or conversational output outside of JSON.

  \`;

  try {

    const response \= await axios.post('http://localhost:11434/api/chat', {

      model: 'llama3:8b',

      messages: \[

        { role: 'system', content: systemPrompt },

        { role: 'user', content: \`Analyze this transcript: "${transcript}"\` }

      \],

      stream: false

    });

    return JSON.parse(response.data.message.content);

  } catch (error) {

    console.error('Failed to extract desires from transcript:', error.message);

    return null;

  }

}

# **5. Local Database Encryption & Security Guardrails**

Due to the deeply sensitive nature of Brakes, Accelerators, and Boundaries, all read/write queries touching user profiles or feedback notes execute through a cryptographic AES-256 wrapper, while searchable boundary checks use deterministic blind indexing hashes:

import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.DATABASE_KEY; // Must be 256 bits (32 characters)
const HASH_SALT = process.env.AFFILIATE_HASH_KEY; // Salt for blind indexing
const IV_LENGTH = 16; // For AES

// Encrypt text (sensitive open fields like survey notes)
export function encryptText(text: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

// Decrypt text
export function decryptText(text: string): string {
  const textParts = text.split(':');
  const iv = Buffer.from(textParts.shift()!, 'hex');
  const encryptedText = Buffer.from(textParts.join(':'), 'hex');
  const decipher = crypto.createDecipheriv('aes-256-cbc', Buffer.from(ENCRYPTION_KEY), iv);
  let decrypted = decipher.update(encryptedText);
  decrypted = Buffer.concat([decrypted, decipher.final()]);
  return decrypted.toString();
}

// Deterministic Blind Index Hash (allows exact matches/joins on SQLite index without decrypting)
export function hashDesireTag(tag: string): string {
  return crypto
    .createHmac('sha256', HASH_SALT)
    .update(tag.trim().toLowerCase())
    .digest('hex');
}

# **6\. Environment Variables Blueprint (`ops/.env.example`)**

The following variables must be configured in your local environment file (`ops/.env`) to launch the Phase II runtime:\# 1\. Local Database Security Key (Must be 32 characters for AES-256-CBC)

DATABASE\_KEY=your\_secure\_32\_char\_database\_key

\# 2\. Managed Real-Time State Syncer (Supabase Credentials)

SUPABASE\_URL=https://your-supabase-project-id.supabase.co

SUPABASE\_ANON\_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

\# 3\. Local AI Engine Endpoints

OLLAMA\_HOST=http://localhost:11434

\# 4\. Outbound Affiliate Product Sourcing Tracker Hash Key

AFFILIATE\_HASH\_KEY=your\_outbound\_link\_hashing\_private\_salt\_key  
