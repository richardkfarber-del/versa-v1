# **Versa — Core Feature Set (Phase II: AI Concierge & Real-Time Sync Expansion)**

# **1\. Introduction & Phase II Objective**

The objective of Versa Phase II is to transition the application from a static, pre-written matchmaking database into a dynamic, highly responsive **AI Concierge**. In alignment with Phase II's architectural standards, the platform maintains extreme data privacy and zero-knowledge style security while introducing robust multi-device real-time state synchronization (via Supabase Realtime) and context-aware local AI orchestration (via local Llama 3).

By utilizing a local-first, offline-capable database model, couples can safely take independent desire quizzes without mutual influence, cross-reference their profiles in a blind matching dashboard, launch synchronized 15-minute date nights, and trigger a co-regulation "emergency brake" instantly if either partner feels overwhelmed.

# **2\. Core MVP Features**

# **Feature 1: Conversational Connection Compass (AI-Powered Desire Profiler)**

* **Description:** Replaces rigid multiple-choice onboarding questionnaires with an interactive, empathetic AI chat interface that extracts sensitive psychological and sexual data.  
* **Functional Capabilities:**  
  * **Linguistic Intake:** Uses local Llama 3 (8B) or a secure fallback API connection to conduct an open-ended conversational assessment, asking gentle, trauma-informed follow-up questions.  
  * **Entity Extraction:** Extracts Brakes (stress triggers, fatigues), Accelerators (sensory cues, emotional needs), and Boundaries from the user's free text.  
  * **Linguistic Tone Profiling:** Detects the user's comfort vocabulary and preferred conversational style, mapping the profile to either Clinical, Romantic, or Spicy/Dominant tone preferences.  
  * **Encrypted Storage:** Writes the structured extraction tags directly to the local SQLite `user_preferences` tables inside the user's private, encrypted profile.

# **Feature 2: Context-Aware "Vibe Check" & Generative Itinerary Builder**

* **Description:** Dynamically generates customized, 15-minute guided date night scripts on the fly, matching the couple's immediate emotional and physical capacities.  
* **Functional Capabilities:**  
  * **Intake Interface (Vibe Check):** Renders slider bars for physical energy, time bounds (15/30/45 min), and emotional capacity.  
  * **Inclusive Script Generation:** Queries local Llama 3 (8B) using the couple's overlapping desire tags. The generator automatically incorporates their specific names, preferred pronouns, and pre-screened fantasies.  
  * **Strict Content Guardrails:** System prompts enforce clinical-grade safety barriers, automatically stripping any off-limits keywords or BDSM triggers mapped in the user's boundary tables before context reaches the model.  
  * **Dynamic UI Player:** Renders the generated script as an interactive, tabbed, 3-interval step-by-step player with timer tracking.

# **Feature 3: Real-Time Partner Linking & Safety Brake (Supabase Sync)**

* **Description:** Synchronizes active date nights in real-time across both partners' devices and executes the somatic co-regulation emergency protocol.  
* **Functional Capabilities:**  
  * **Asynchronous Onboarding Link:** Secure invite-code pairing system that links "Partner A" and "Partner B" into a shared session state via a Supabase Realtime channel without merging their private accounts.  
  * **Live Countdown Sync:** Synchronizes the 15-minute date-night countdown and step-by-step text transitions across both devices within 200ms.  
  * **The Digital Safe Word ("Red Light"):** Renders a highly visible, persistent "Red Light/Pause" button on both devices.  
  * **Synchronized Grounding Redirect:** Clicking "Red Light" immediately interrupts the timer, broadcasts a pause state, and instantly redirects both frontend viewports to a calming "Grounding Screen" featuring progressive breathing circle animations and somatic grounding prompts.

# **Feature 4: Somatic Pre-Intimacy & Psychoeducation Hub**

* **Description:** Standardizes stress transition routines and delivers bite-sized therapeutic audio modules.  
* **Functional Capabilities:**  
  * **Transition Breathing Guides:** Renders animated SVG Lottie breathing circle guides (4s inhale, 4s hold, 6s exhale) to help couples co-regulate their nervous systems and transition out of stressful daily mindsets.  
  * **Expert Psychoeducation:** Provides a local audio playback engine featuring 3-minute clips from licensed sex therapists and trauma specialists, addressing topics like trigger de-escalation and attachment patterns.  
  * **Structured Aftercare:** At the end of a date, prompts the couple into cozy holding positions and provides non-intrusive emotional check-in questions.

# **Feature 5: Adaptive Safety Blacklisting (Feedback Loop)**

* **Description:** Ingests post-date ratings and comments to guarantee that triggering, uncomfortable, or low-scoring activities are never suggested again.  
* **Functional Capabilities:**  
  * **Post-Date Afterglow Survey:** Renders a simple, 3-question survey capturing ratings for Safety (1-5), Arousal (1-5), and Connection (1-5), with open notes.  
  * **Feedback Ingestion Engine:** If a safety rating is \<= 2 or specific "disliked" comments are entered, the system automatically parses and extracts the associated itinerary tags.  
  * **SQLite Blacklist Write-back:** Writes the identified trigger tags directly to the SQLite `blacklisted_desires` table. The generative script engine joins against this table to sanitize all future prompt variables.

# **Feature 6: Intelligent Affiliate Product Sourcing**

* **Description:** Recommends high-quality, body-safe intimacy products (massage oils, toys) matching the couple's matched desires, utilizing direct affiliate links.  
* **Functional Capabilities:**  
  * **Matching Product Injected Cards:** Scours your local partner database to display product cards next to matched desires (e.g. warming candles for "Temperature Play" matches).  
  * **Hashed Outbound Links:** Encrypts outbound partner URLs to ensure user identity and private preferences are never leaked in web headers.

# **3\. Supporting Technical Operations & Admin Flows**

* **Content Library Management:** A basic dashboard for admins to seed somatic templates, upload therapist audio, and manage the `affiliate_products` SQLite tables.  
* **Security Session Management:** Active local sessions automatically lock or time out after 10 minutes of inactivity to protect sensitive data on shared home devices.

