# **Versa — Core Feature Set (Phase III: Collaborative Execution & Operational Security)**

# **1\. Introduction & Phase III Objective**

The objective of Versa Phase III is to scale the existing React/Express/SQLite local-first architecture into a highly collaborative, cost-controlled, and operationally secure team and partner workspace. Phase III implements shared partner scheduling, automated notifications, lightweight admin portals, hybrid model routing with local AI response caching, and Git-backed database synchronization.

These collaborative features expand the application’s footprint from an active, on-demand tool into a daily relationship maintenance workspace while strictly preserving your local-first, privacy-respecting core principles.

# **2\. Core MVP Features**

# **Feature 1: Proactive Partner Linking & Low-Pressure Nudge System**

* **Description:** Permits partners to monitor each other's assessment status and send system-generated, low-pressure notifications.  
* **Functional Capabilities:**  
  * **Nudge Trigger:** If Partner A has completed their Connection Compass but Partner B is pending, Partner A's dashboard displays a soft, animated "Nudge Partner" button.  
  * **System-Generated Reminders:** Clicking the button triggers a push notification to Partner B’s device (via Firebase Cloud Messaging / Supabase Push) using pre-written, encouraging copy.  
  * **Dashboard Status Tracker:** Displays clear, real-time indicators for "Partner is Taking the Compass" or "Pairing Pending."

# **Feature 2: Shared Intimacy Calendar & Scheduling Board**

* **Description:** An in-app, shared calendar workspace where partners can propose, schedule, and commit to date-night sessions.  
* **Functional Capabilities:**  
  * **Proposal Board:** Users browse the unlocked date night library, select an itinerary, and click "Propose Date." They select a target date and time.  
  * **Shared Calendar View:** Proposals appear as pending events on both partners' in-app calendars. The partner can accept, decline, or propose an alternative time.  
  * **Automated Reminders:** Once committed, the system schedules background push notifications to fire on both devices 15 minutes before the date.

# **Feature 3: Cryptographic Unlinking & Account Self-Destruct**

* **Description:** Offers a secure, absolute privacy escape hatch in the relationship settings to immediately sever data sharing.  
* **Functional Capabilities:**  
  * **The Self-Destruct Toggle:** Located in the relationship settings, a "Sever Connection" button requires the user to input their password to confirm.  
  * **Cryptographic Salt Purge:** Upon confirmation, the local Express server immediately wipes the `pairing_id`, deletes the shared cryptographic salt key, and purges all decrypted active session cache tables from both partner devices.  
  * **Instant Dashboard Lock:** Both devices are instantly logged out, redirected to the landing page, and their matching dashboards are locked.

# **Feature 4: GitHub-Backed Collaborative Database Synchronizer**

* **Description:** A zero-vendor-cost collaborative database hosting solution that leverages your existing private GitHub repository to synchronize the application database.  
* **Functional Capabilities:**  
  * **On-Launch Auto-Pull:** During backend Express startup, the server executes a quiet, non-blocking `git pull --rebase` against the private database repo to fetch and merge any new calendar entries or completed date metrics uploaded by the partner.  
  * **Checkpoint-Driven Commits:** Triggers automated background `git add`, `git commit`, and `git push` commands on key events (e.g. scheduling a date night, finishing an Afterglow survey, or unlinking).  
  * **Safe Conflict Resolution:** In the event of parallel offline updates, the synchronizer uses a standard merge controller (such as last-write-wins) to resolve database conflicts gracefully.

# **Feature 5: Admin Portal & Dynamic Content Curation Workspace**

* **Description:** A lightweight, secure web dashboard allowing Blair and Rachel to manage app content dynamically without developer intervention.  
* **Functional Capabilities:**  
  * **Date Itinerary Manager:** Admins draft, edit, tag (e.g. "Low Energy"), and publish new date nights directly to the database.  
  * **Assessment Matrix Editor:** Permits adding, removing, or re-ordering questions within the Connection Compass categories (Brakes, Accelerators, Boundaries).  
  * **Paywall Toggler:** A toggle next to each date itinerary to lock it behind the premium $10/month tier or set it as free.

# **Feature 6: Hard-Scoped Context Boundaries & AI Response Caching**

* **Description:** Enforces strict semantic context barriers to protect private data and caches LLM responses to reduce costs.  
* **Functional Capabilities:**  
  * **Context Boundaries:** When running RAG audits or chats, the server serializes the active viewport state to strictly limit LLM context search queries to active ticket schemas.  
  * **Response Cache Table:** Stores unique cryptographic hashes of specifications and prompts. If the input hash matches, it instantly returns the cached JSON summary, reducing costly cloud and local LLM execution times.

