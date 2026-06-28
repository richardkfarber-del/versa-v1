# **Versa — Environment Preparation Checklist (Phase III: Collaborative Execution & Operational Security)**

This document details the exact terminal initialization, database migration commands, and dependency installations that the Google Antigravity agent must execute before writing any application code for Phase III.

# **1\. Environment Verification & Startup**

Before executing any commands, verify that your local development environment has the following baseline runtimes active:

* **Node.js:** v18.16.0 or higher (`node --version`)  
* **npm:** v9.0.0 or higher (`npm --version`)  
* **Git:** v2.34.0 or higher (`git --version`) configured to your private database sync repository.  
* **Firebase Project:** A configured Firebase project with an active service account key for push notifications.

# **2\. Directory Verification**

Ensure the following local folder paths are scaffolded in the repository root and read/write accessible:

* Project Documentation: `docs/project/`  
* Process Backlogs: `docs/process/`  
* Configurations and Seeds: `ops/` (ensure `ops/firebase-service-account.json` exists)  
* Application Source: `src/` (Express routes and React components)

# **3\. Dependency Scaffolding Commands**

Execute the following commands from the root application directory to install the new packages required for the Git-backed synchronization engine, Firebase Cloud Messaging, and FullCalendar scheduling components:\# Install Git and Firebase Admin SDK helper libraries for Node backend

npm install simple-git firebase-admin \--save

\# Install FullCalendar UI components for React frontend

npm install @fullcalendar/react @fullcalendar/daygrid @fullcalendar/timegrid \--save

\# (Optional) Verify all dependencies compile cleanly with TypeScript

npm run build

# **4\. Database Schema Migration Script**

To apply the schema extensions defined in the Technical Specification, run the following SQLite migration command. This extends your local SQLite database with Phase III scheduling, caching, sync metadata, and admin authorization tables:\# Access the local SQLite database

sqlite3 versa.db \<\<SQL\_MIGRATION

\-- 1\. Create the Shared Intimacy Calendar table

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

\-- 2\. Create the AI Response Cache table

CREATE TABLE IF NOT EXISTS ai\_cache (

    id TEXT PRIMARY KEY,

    input\_hash TEXT NOT NULL UNIQUE, \-- SHA-256 hash of prompts and context

    prompt\_type TEXT NOT NULL, \-- 'readiness\_audit', 'itinerary\_generate'

    response\_text TEXT NOT NULL, \-- Cached LLM response string

    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP,

    invalidated INTEGER DEFAULT 0 \-- 0 \= Valid, 1 \= Invalidated

);

\-- 3\. Create the Sync Metadata table

CREATE TABLE IF NOT EXISTS sync\_metadata (

    id TEXT PRIMARY KEY,

    last\_sync\_time TIMESTAMP,

    last\_sync\_status TEXT, \-- 'Success', 'Conflict', 'Offline'

    local\_commit\_hash TEXT,

    remote\_commit\_hash TEXT

);

\-- 4\. Create the Admin Users table (for content curation portal)

CREATE TABLE IF NOT EXISTS admins (

    id TEXT PRIMARY KEY,

    email TEXT NOT NULL UNIQUE,

    password\_hash TEXT NOT NULL,

    role TEXT DEFAULT 'editor', \-- 'owner', 'editor'

    created\_at TIMESTAMP DEFAULT CURRENT\_TIMESTAMP

);

SQL\_MIGRATION

# **5\. Application Verification Run**

Verify that the local-first servers boot concurrently without errors after dependency installation and database migrations:\# Run both the React frontend and Express backend servers

npm start  
