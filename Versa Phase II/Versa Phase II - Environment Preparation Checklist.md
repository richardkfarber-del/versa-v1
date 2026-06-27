# **Versa — Environment Preparation Checklist (Phase II: AI Concierge & Real-Time Sync Expansion)**

This document details the exact terminal initialization, database migration commands, and dependency installations that the Google Antigravity agent must execute before writing any application code for Phase II.

# **1\. Environment Verification & Startup**

Before executing any commands, verify that your local development environment has the following baseline runtimes active:

* **Node.js:** v18.16.0 or higher (`node --version`)  
* **npm:** v9.0.0 or higher (`npm --version`)  
* **Ollama:** Running locally (`ollama --version`) with the `llama3:8b` and `nomic-embed-text` models pre-pulled.  
* **Supabase CLI:** Active and logged in locally (`supabase --version`) to support managed real-time state syncing database queries.

# **2\. Directory Verification**

Ensure the following local folder paths are scaffolded in the repository root and read/write accessible:

* Project Documentation: `docs/project/` (Project Charter, Specifications, Features)  
* Process Backlogs: `docs/process/` (Backlog, Roadmap, Learning logs)  
* Configurations and Seeds: `ops/` (Environment placeholders, seed files)  
* Application Source: `src/` (Empty directory or containing prototype boilerplate)

# **3\. Dependency Scaffolding Commands**

Execute the following commands from the root application directory to install the new packages required for the Supabase real-time sync client, vector embedding management, Lottie animations, and LLM prompt processing:\# Install Supabase real-time sync client and Lottie animations UI packages

npm install @supabase/supabase-js lottie-react react-spring \--save

\# Install NLP utility libraries for parsing and cleaning LLM text outputs

npm install langchain text-cleaner \--save

\# (Optional) Verify all dependencies compile cleanly with TypeScript

npm run build

# **4. Database Schema Migration Script**

To apply the schema extensions defined in the **Technical Specification**, run the following SQLite migration command. This extends your local SQLite database with Phase II state-syncing, afterglow, and safety blacklisting properties:

# Access the local SQLite database
sqlite3 versa.db <<SQL_MIGRATION

-- 1. Extend the core User Profiles table to support dynamic AI quiz results and tone settings
ALTER TABLE users ADD COLUMN compass_answers TEXT; -- Encrypted JSON string
ALTER TABLE users ADD COLUMN tone_preference TEXT DEFAULT 'warm';

-- 2. Create the Active Sync Sessions table (replicated to Supabase)
CREATE TABLE IF NOT EXISTS active_sessions (
    pairing_id TEXT PRIMARY KEY, -- UUID (TEXT)
    timer_countdown INTEGER DEFAULT 900,
    session_status TEXT DEFAULT 'Timer_Active', -- Timer_Active, Paused, Grounding
    partner_a_active INTEGER DEFAULT 0,
    partner_b_active INTEGER DEFAULT 0,
    active_script_id TEXT,
    last_event_triggered TEXT,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(pairing_id) REFERENCES pairings(id) ON DELETE CASCADE
);

-- 3. Create the Blacklisted Desires / Boundaries table
CREATE TABLE IF NOT EXISTS blacklisted_desires (
    id TEXT PRIMARY KEY, -- UUID (TEXT)
    user_id TEXT NOT NULL,
    desire_tag_hash TEXT NOT NULL, -- SHA-256 blind index hash
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
    UNIQUE(user_id, desire_tag_hash)
);

-- 4. Create the Post-Date "Afterglow" Feedback table
CREATE TABLE IF NOT EXISTS afterglow_surveys (
    id TEXT PRIMARY KEY, -- UUID (TEXT)
    pairing_id TEXT NOT NULL, -- UUID (TEXT)
    user_id TEXT NOT NULL, -- UUID (TEXT)
    safety_rating INTEGER CHECK(safety_rating >= 1 AND safety_rating <= 5),
    arousal_rating INTEGER CHECK(arousal_rating >= 1 AND arousal_rating <= 5),
    connection_rating INTEGER CHECK(connection_rating >= 1 AND connection_rating <= 5),
    notes TEXT, -- Encrypted open notes
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(pairing_id) REFERENCES active_sessions(pairing_id) ON DELETE CASCADE,
    FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 5. Create the Affiliate Product recommendations table
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

SQL_MIGRATION

# **5\. Application Verification Run**

Verify that the local-first servers boot concurrently without errors after dependency installation and database migrations:\# Run both the React/Svelte frontend and server backend concurrently

npm start  
