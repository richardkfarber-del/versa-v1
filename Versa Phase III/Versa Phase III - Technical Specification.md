# **Versa — Technical Specification (Phase III: Collaborative Execution & Operational Security)**

# **1\. Architectural Overview & Technical Stack**

Versa Phase III extends the local-first architecture to support shared partner execution, asynchronous database synchronization, and expert-backed web administration.

* **Frontend:** React 19, TypeScript, Vite, Tailwind CSS. Updates include settings panels, the interactive Intimacy Calendar, and real-time pairing sync indicators.  
* **Backend:** Node.js, Express.js. Employs new services for handling simple-git, Firebase Cloud Messaging, and local SQLite response caching.  
* **Notification Engine:** Firebase Cloud Messaging (FCM) or Supabase Push client. Delivers quiet, non-blocking nudge and calendar reminders.  
* **Database Sync Engine:** SQLite (`better-sqlite3`) synchronized asynchronously via simple-git subprocesses over your existing private GitHub repository.  
* **AI Cache & Guardrails:** Relational database table `ai_cache` to store prompt-to-response pairs and enforce semantic context limits.

# **2\. Database Schema Extensions (SQLite)**

To support the collaborative scheduling and caching mechanisms, the local database schema is extended with the following table definitions:-- 1\. Shared Intimacy Calendar table

CREATE TABLE IF NOT EXISTS calendar\_events (

    id TEXT PRIMARY KEY,

    pairing\_id TEXT NOT NULL,

    itinerary\_id TEXT NOT NULL,

    proposed\_by TEXT NOT NULL,

    scheduled\_time TIMESTAMP NOT NULL,

    status TEXT DEFAULT 'Pending', \-- 'Pending', 'Confirmed', 'Declined'

    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

    FOREIGN KEY(pairing\_id) REFERENCES active\_sessions(pairing\_id) ON DELETE CASCADE

);

\-- 2\. AI Response Cache table

CREATE TABLE IF NOT EXISTS ai\_cache (

    id TEXT PRIMARY KEY,

    input\_hash TEXT NOT NULL UNIQUE, \-- SHA-256 hash of prompts and context

    prompt\_type TEXT NOT NULL, \-- 'readiness\_audit', 'itinerary\_generate'

    response\_text TEXT NOT NULL, \-- Cached LLM response string

    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

    invalidated INTEGER DEFAULT 0 \-- 0 \= Valid, 1 \= Invalidated

);

\-- 3\. Sync Metadata table

CREATE TABLE IF NOT EXISTS sync\_metadata (

    id TEXT PRIMARY KEY,

    last\_sync\_time TIMESTAMP,

    last\_sync\_status TEXT, \-- 'Success', 'Conflict', 'Offline'

    local\_commit\_hash TEXT,

    remote\_commit\_hash TEXT

);

\-- 4\. Admin Users table (for content curation portal)

CREATE TABLE IF NOT EXISTS admins (

    id TEXT PRIMARY KEY,

    email TEXT NOT NULL UNIQUE,

    password\_hash TEXT NOT NULL,

    role TEXT DEFAULT 'editor', \-- 'owner', 'editor'

    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

# **3\. GitHub-Backed Collaborative Database Synchronizer**

To synchronize the local SQLite database across devices without deploying expensive cloud clusters, the backend automates Git sub-processes:import simpleGit from 'simple-git';

const git \= simpleGit();

export async function pullDatabase() {

  try {

    // startup auto-pull to fetch calendar schedules from partner

    await git.pull('origin', 'main', { '--rebase': 'true' });

    console.log('Database synced from GitHub successfully\!');

  } catch (err) {

    console.error('Git synchronization failed, running in local-only mode:', err.message);

  }

}

export async function pushDatabase(userEmail: string) {

  try {

    await git.add('versa.db');

    await git.commit(\`Partner Sync Checkpoint: ${userEmail} \- ${new Date().toISOString()}\`);

    await git.push('origin', 'main');

    console.log('Database updates pushed to GitHub\!');

  } catch (err) {

    console.error('Git push failed, changes saved locally:', err.message);

  }

}

# **4\. AI Response Caching Middleware**

Before sending any prompting queries to Ollama or Gemini, the backend Express controller executes the following logic to check for cached specifications:import crypto from 'crypto';

import db from '../db'; // SQLite better-sqlite3 instance

export function getCacheKey(promptType: string, promptContent: string): string {

  return crypto.createHash('sha256').update(\`${promptType}\_${promptContent}\`).digest('hex');

}

export function checkCache(hash: string) {

  const row \= db.prepare('SELECT response\_text FROM ai\_cache WHERE input\_hash \= ? AND invalidated \= 0').get(hash);

  return row ? JSON.parse(row.response\_text) : null;

}

export function saveCache(id: string, hash: string, type: string, payload: any) {

  db.prepare('INSERT OR REPLACE INTO ai\_cache (id, input\_hash, prompt\_type, response\_text) VALUES (?, ?, ?, ?)')

    .run(id, hash, type, JSON.stringify(payload));

}

# **5\. Cryptographic Self-Destruct Unlinking Protocol**

When unlinking is triggered, the Express backend immediately wipes all shared keys, pairing IDs, and active session cache from both partner devices to ensure complete data sovereignty:import db from '../db';

export async function executeSelfDestruct(pairingId: string) {

  try {

    db.serialize(() \=\> {

      // 1\. Delete the active sync session

      db.prepare('DELETE FROM active\_sessions WHERE pairing\_id \= ?').run(pairingId);

      // 2\. Delete all related shared calendar events

      db.prepare('DELETE FROM calendar\_events WHERE pairing\_id \= ?').run(pairingId);

      // 3\. Nullify the partner linking details on the user profiles

      db.prepare("UPDATE users SET pairing\_id \= NULL, status \= 'Unlinked' WHERE pairing\_id \= ?").run(pairingId);

    });

    console.log(\`Self-Destruct completed successfully for session: ${pairingId}\`);

    return true;

  } catch (error) {

    console.error('Failed to complete self-destruct unlinking:', error.message);

    throw error;

  }

}  
