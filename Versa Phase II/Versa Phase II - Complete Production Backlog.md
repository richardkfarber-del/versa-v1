# **Versa — Complete Production Backlog (Phase II: AI Concierge & Real-Time Sync Expansion)**

This document details the granular, developer-ready backlog tickets for Phase II. Every ticket conforms to Versa's local-first, offline-ready design and includes explicit technical execution details, positive test criteria, and negative test criteria to guide automated agents during implementation.

# **Epic 7: The Conversational Connection Compass**

# **VERSA-701: Conversational Chat-Based Intake Service & AI Desire Extractor**

# **User Story**

As a user, I want my onboarding and desire quiz to be a conversational, empathetic chat with an AI assistant, so that I can describe my intimate boundaries and desires in natural language.

# **Technical Implementation Details**

* **Target Frontend:** `src/components/CompassChat.tsx` or Svelte equivalent. Render a chat interface displaying typing indicators, bubble messages, and an open text input field.  
* **Target Backend:** `src/routes/compass.ts` or FastAPI equivalent. Implement POST `/api/compass/chat`.  
* **LLM Prompting & Parse Middleware:** In `src/services/compass_agent.ts`, format the system prompt to guide Ollama (llama3:8b) or a secure Claude API key transaction. The model must analyze the user's natural language inputs, prompt for clarification on ambiguous statements (e.g. Brakes vs. Accelerators), and return a highly structured JSON output:{  
    
    "brakes": \["high stress", "work fatigue"\],  
    
    "accelerators": \["ambient lighting", "somatic touch"\],  
    
    "boundaries": \["no blindfolds"\],  
    
    "tone\_preference": "clinical"  
    
  }  
    
* **Database Schema:** Write extracted JSON data directly into the user's encrypted SQLite profile row under `compass_answers`.

# **Positive Test Criteria**

1. Input "I'm always stressed after work and need soft massage to get in the mood. I hate blindfolds."; verify the chat service responds with an empathetic, non-judgmental question.  
2. Inspect the local database; verify "brakes" correctly receives "high stress", "accelerators" receives "somatic touch", and "no blindfolds" is cataloged in the boundaries table.  
3. Verify the dynamic "tone\_preference" updates to adjust future guided scripts.

# **Negative Test Criteria**

1. Submit empty text or gibberish (e.g. "asdfasdf"); verify the assistant responds with a soft, trauma-informed prompt urging the user to take their time and try again, and does not update the database.  
2. Simulate a total API disconnect; verify the frontend displays a localized fallback message and saves the current conversation draft locally for later sync.

# **Epic 8: Generative Date Nights Engine**

# **VERSA-801: Real-Time "Vibe Check" Form & Contextual Intimacy Script Generator**

# **User Story**

As a couple, we want to perform a 30-second "Vibe Check" before starting a date, so that the AI generates a customized, 15-minute intimacy itinerary matching our immediate capacity.

# **Technical Implementation Details**

* **Frontend UI:** Create `src/components/VibeCheck.tsx`. Renders slider bars for \[Energy: Low \-\> High\] and toggles for \[Available Time: 15 / 30 / 45 Min\] and \[Focus: Verbal / Sensory / Breathing\].  
* **Backend Generator:** Create `/api/itinerary/generate` in `src/routes/itinerary.ts`.  
  1. Fetch Partner A's and Partner B's overlapping matched desire tags from SQLite.  
  2. Pass the Vibe Check parameters, user names/preferred pronouns, and pre-screened desires to the local Llama service.  
  3. The system prompt enforces clinical-grade, trauma-informed safety bounds. The LLM must output a structured, step-by-step 3-interval date script (e.g., Step 1: Somatic check-in, Step 2: Mindful massage, Step 3: Cozy afterglow).  
* **Database Store:** Write the active generated script to the shared SQLite state table `active_session`.

# **Positive Test Criteria**

1. Select "Low Energy, 15 minutes, Focus: Sensory"; verify the AI returns a gentle, low-movement massage guide incorporating correct user names and pronouns.  
2. Verify that a generated step is saved to the SQLite table and retains formatting when loaded on the active player.  
3. Check that any boundaries in the boundaries database table are strictly stripped from the prompt's context before reaching the model.

# **Negative Test Criteria**

1. Input conflicting values (e.g., zero time); verify validation blockers raise a clear inline alert, preventing the API call.  
2. If the LLM fails or throws a timeout exception, verify the app instantly falls back to a pre-vetted static script (e.g., "The Slow Burn") to prevent the couple's date night from being interrupted.

# **Epic 9: Device Syncing & Safety Brake Sync**

# **VERSA-901: Supabase Realtime Partner Session Linker & Synchronized "Red Light" Grounding Event**

# **User Story**

As a trauma survivor, I want a highly visible "Red Light" button on my screen during a date night, so that I can instantly pause the session and shift both of our screens to a co-regulation grounding exercise.

# **Technical Implementation Details**

* **Supabase Realtime Sync:** Integrate the Supabase JS SDK client in `src/services/realtime.ts`. Subscribe both devices to table changes on `active_sessions` filtered by the pairing ID.
* **Active Countdown:** The Express backend manages the ticking state machine and updates the local SQLite `active_sessions` table, which automatically replicates to Supabase. Reconnecting or joining clients fetch the current state from the Express REST API.
* **Emergency Brake Protocol ("Red Light"):**  
  * If Partner A clicks "STOP/Red Light," update the `active_sessions` database table immediately.  
  * The database change replicates to Partner B's client, forcing both viewports to switch from `src/components/ActiveDate.tsx` to `src/components/GroundingScreen.tsx`.  
* **Somatic Grounding UI:** The Grounding Screen immediately renders an interactive breathing Lottie animation and displays progressive muscle relaxation prompts.

# **Positive Test Criteria**

1. Connect Partner A and Partner B devices on separate networks; click "Pause" on Partner A and verify Partner B's countdown timer pauses within 200ms via replicated table updates.  
2. Click "Red Light" on Partner A; verify Partner B's screen instantly redirects to the Breathing Grounding screen.  
3. Confirm that state survives a hard page refresh or network drop by fetching current state via the Express REST API on reconnect.

# **Negative Test Criteria**

1. Trigger "Pause" when offline; verify the local SQLite database stores the event and syncs it immediately upon internet restoration.  
2. If an invalid device pairing code is supplied, verify the sync engine denies network link and alerts the user with a descriptive pairing error.

# **Epic 10: Somatic Hub & Expert Educational Media**

# **VERSA-1001: React SVG Lottie Breathing Guide & Audio Psychoeducation Modules**

# **User Story**

As a user, I want to engage in 5-minute somatic exercises and listen to bite-sized therapist guides, so that I can reduce performance anxiety and understand my nervous system.

# **Technical Implementation Details**

* **Somatic Animation UI:** Create `src/components/SomaticHub.tsx`. Renders an animated SVG breathing guide using React-Spring or Lottie. The guide coordinates "Inhale (4s)", "Hold (4s)", "Exhale (6s)".  
* **Audio Media Player:** Integrate HTML5 Audio in `src/components/AudioGuide.tsx`. Delivers 3-minute psychoeducational audio clips from licensed therapists.  
* **JSON Data Model:** Create `ops/seeds/psychoeducation.json` to store guides metadata (author, category, duration, file paths).

# **Positive Test Criteria**

1. Open the Somatic Hub and verify the breathing circle expands and contracts precisely with the text prompts.  
2. Launch an audio module; verify that completion updates the user's progress bar.  
3. Confirm that transcripts are instantly readable if the audio file fails to load.

# **Negative Test Criteria**

1. Interrupted audio playback; verify the media engine caches the current timestamp and resumes smoothly without starting over.  
2. Attempting to load a corrupted audio asset redirects cleanly to the written transcript fallback without crashing the app shell.

# **Epic 11: Reinforcement Learning Feedback Loop**

# **VERSA-1101: SQLite Feedback Ingestion Parser & AI-Driven Desires Tag Blacklist Updater**

# **User Story**

As a user, I want the app to learn from my post-date "Afterglow" survey feedback, so that it gets smarter and never suggests an activity that triggered or bored us.

# **Technical Implementation Details**

* **Post-Date Survey:** Create `src/components/AfterglowSurvey.tsx`. Renders a simple, 3-question survey capturing ratings for Safety (1-5), Arousal (1-5), and Connection (1-5).  
* **Feedback Parser Service:** Create `/api/feedback/ingest` in `src/routes/feedback.ts`.  
  1. Parse submitted ratings and open-ended comments.  
  2. If any safety score is \<= 2 or specific "disliked" keywords are entered, extract the associated itinerary desire tags.  
  3. Update the `user_preferences` and `blacklisted_desires` tables in SQLite.  
  4. The generative engine in Sprint 8 must join against the `blacklisted_desires` table to completely sanitize prompts.

# **Positive Test Criteria**

1. Submit an Afterglow survey rating a "Roleplay" session with a Safety score of 1; query SQLite and confirm "roleplay" is added to `blacklisted_desires`.  
2. Run Sprint 8's generation again; verify that no roleplay-themed scripts are suggested, even if previously matched.  
3. Check that the AI adjusts the pacing score for future recommendations.

# **Negative Test Criteria**

1. Submit a survey with blank inputs; verify form validation blocks submission and preserves user notes.  
2. Submit conflicting scores; verify the feedback parser logs the anomaly but proceeds with strict prioritization of safety blacklisting.

# **Epic 12: E-commerce Product Sourcing & Affiliate Integration**

# **VERSA-1201: Matching-Based Affiliate Product Recommender & Outbound Link Encryption**

# **User Story**

As a couple, we want the app to suggest ethical, body-safe intimacy products based on our overlapping matches, so that we can explore safely.

# **Technical Implementation Details**

* **Smart Sourcing Widget:** Create `src/components/ProductRecommender.tsx`. Renders card layouts on the Blind Match dashboard.  
* **Recommendation Engine:** In `src/routes/products.ts`, map desire categories to partnered ethical retailers (e.g. warming massage candles for "Temperature Play").  
* **Outbound Tracker Security:** Encrypt or securely hash outbound affiliate URLs to protect user privacy. No private user tags are passed in query strings.

# **Positive Test Criteria**

1. A couple matches on "Somatic Massage"; verify the dashboard displays a card for an ethical massage oil with a valid affiliate link.  
2. Click the link and verify it redirects cleanly to the partner merchant.  
3. Verify that no user ID or private preference tags are exposed in the URL.

# **Negative Test Criteria**

1. The product database is unreachable; verify the recommender falls back to a clean text-based suggestion (e.g., "Use a warm, natural coconut oil") without breaking the UI.  
2. An invalid merchant ID is provided; verify the app suppresses the card dynamically.

