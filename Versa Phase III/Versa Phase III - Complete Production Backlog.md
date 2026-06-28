# **Versa — Complete Production Backlog (Phase III: Collaborative Execution & Operational Security Sprints)**

This document details the granular, developer-ready backlog tickets for Phase III. Every ticket conforms to Versa's local-first, offline-ready design and includes explicit technical execution details, positive test criteria, and negative test criteria to guide automated agents during implementation.

# **Epic 13: Nudge & Empty State Guarding**

# **VERSA-1301: React Dashboard Empty State, Invite Code Drawer, and Push Nudge Routing**

# **User Story**

As a user, I want a clear "Waiting for Partner" dashboard with my invite code and a soft nudge reminder option, so that I can manage pairing safely without staring at a blank screen.

# **Technical Implementation Details**

* **Target Frontend:** `src/components/Dashboard.tsx`. Check the user's `pairing_id` state on mount:  
  * If `pairing_id === null`, bypass the standard dashboard layout and render a dedicated "Waiting for Partner" view featuring a large "Copy Invite Code" card and an "Invite Input" form.  
  * If `pairing_id !== null` but the partner has not completed their Compass quiz (`partner_compass_completed === 0`), show a "Partner is Taking the Compass" indicator with a prominent "Nudge Partner" button.  
* **Target Backend:** In `routes/relationship.js`, create `POST /api/v1/relationship/nudge`.  
  * Fetch the paired partner's device tokens from SQLite.  
  * Trigger a secure outbound push notification via the Firebase Cloud Messaging Admin SDK using the warm, pre-written nudge template: *"Your partner is waiting in your Intimacy Sanctuary. Whenever you're ready, take the Compass so you can connect."*

# **Positive Test Criteria**

1. Log in as a newly registered, unpaired user; verify the dashboard strictly hides Blind Matching cards, renders the "Waiting for Partner" empty state, and copies their UUID pair code with one click.  
2. Input a valid partner code; verify the dashboard instantly transition to the "Partner is Taking the Compass" indicator.  
3. Click "Nudge Partner"; verify that a push notification is successfully transmitted to the partner's device.

# **Negative Test Criteria**

1. Attempt to trigger the nudge API for an unpaired account; verify the backend catches the exception, blocks the push request, and returns a `400 Bad Request` error.  
2. Simulate a Firebase SDK connection timeout; verify the frontend gracefully handles the timeout, displaying an unobtrusive "Nudge failed to send, please try again" warning banner without freezing the UI.

# **Epic 14: Intimacy Planner & Secure Unlinking**

# **VERSA-1401: React Interactive Intimacy Calendar, Propose Date Board, and Cryptographic Unlinking Route**

# **User Story**

As a couple, we want a shared intimacy calendar to plan date nights, and a secure "self-destruct" settings toggle to instantly unlink and wipe our shared data footprint if our relationship changes.

# **Technical Implementation Details**

* **Intimacy Calendar Frontend:** Create `src/components/IntimacyCalendar.tsx` using FullCalendar React.  
  * Proposal Card: When browsing the unlocked date night library, clicking a date itinerary opens a "Propose Date" modal. Selecting a date/time writes a row to the SQLite `calendar_events` table with `status = 'Pending'`.  
  * The partner sees the proposed date in amber on their calendar view. They can select "Accept" (updates row to `'Confirmed'`) or "Decline" (deletes row).  
* **Self-Destruct Backend:** In `routes/relationship.js`, implement `POST /api/v1/relationship/unlink`.  
  * Initiate a strict, atomic database transaction to delete the `pairing_id` link from `users`, delete the `active_sessions` row, and delete all matching `calendar_events`.  
  * Purge the decrypted state caches and force a logout redirect on both active partner devices.

# **Positive Test Criteria**

1. Click "Propose Date" on a 15-minute massage itinerary; verify that a pending calendar entry is written to SQLite and displays in amber on the partner's calendar.  
2. Accept the proposed date; verify that the status changes to "Confirmed" and the calendar color shifts to green.  
3. Click "Sever Connection" in the relationship settings; verify both devices are instantly logged out, redirected to the landing page, and all pairing entries are successfully purged from SQLite.

# **Negative Test Criteria**

1. Attempt to schedule an itinerary that is marked as "Premium" while operating on the free tier; verify the calendar triggers the paywall modal instead of creating the event.  
2. If the SQLite database is write-locked during an unlinking attempt, verify that the transaction rolls back cleanly, preserving local data safely.

# **Epic 15: Content Publishing & Database Sync**

# **VERSA-1501: React `/admin` Portal, Itinerary Seeding, and Git-Backed SQLite Replication**

# **User Story**

As an admin (Blair/Rachel), I want an admin panel to manage content, and as a developer, I want the SQLite database file to sync across devices via GitHub to ensure a zero-cost collaborative workspace.

# **Technical Implementation Details**

* **Admin Panel UI:** Create `src/components/admin/AdminPortal.tsx`. Restrict access using the custom admin JWT token.  
  * Provide form inputs to draft, tag (e.g. "Low Energy"), and publish itineraries, and toggles to flag scripts as premium.  
* **Database Sync Service:** In `server.js` (Express startup middleware), run `pullDatabase()` from the `database.js` utility. This executes a background `git pull --rebase` using the `simple-git` package.  
* **Checkpoint Push:** When key transactional checkpoints occur (e.g. confirming a date night or unlinking), trigger `pushDatabase()` in the background to commit and push the updated `versa.db` file.

# **Positive Test Criteria**

1. Log in as an admin and publish a new date script; verify it writes to the SQLite database and displays instantly in the client library.  
2. Complete a date night session; check the server console and confirm that `git push` is triggered in the background to sync the DB file.  
3. Upon restarting the backend Express server, verify that `git pull --rebase` executes cleanly before database connection.

# **Negative Test Criteria**

1. Attempt to access the `/admin` workspace using a standard client token; verify the routing middleware blocks the request and redirects to a `403 Unauthorized` page.  
2. Trigger database sync while the host machine is completely offline; verify that the simple-git service catches the network timeout exception gracefully, allows the user to operate in local-only mode, and logs the offline status.

