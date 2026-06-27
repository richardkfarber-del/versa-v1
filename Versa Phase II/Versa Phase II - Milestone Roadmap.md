# **Versa — Milestone Roadmap (Phase II: AI Concierge & Real-Time Sync Expansion)**

This document outlines a structured, 6-sprint development roadmap (Sprints 7-12) to expand Versa into a highly secure, trauma-informed intimacy application utilizing local AI orchestration and real-time state synchronization.

Proposal Review Date: June 27, 2026  
Lead Architect: Richard Farber

# **Sprint 7: The Conversational Connection Compass**

**Epic: Dynamic AI-Powered Intake**

* **Milestone Goals:** Implement the conversational AI assessment engine. Migrate from the static multiple-choice quiz to an interactive, empathetic, conversational AI agent that conducts personal assessments, performs personalized follow-up, and extracts user Brakes, Accelerators, and Boundaries into encrypted SQLite profiles.  
* **User Stories:**  
  * *As a user,* I want to take a conversational desire quiz rather than a rigid multiple-choice form, so that I can express my complex boundaries in my own words.  
  * *As a partner,* I want the AI to analyze my partner's text inputs and adapt the tone of the app (romantic, clinical, or spicy) to fit our shared comfort level.  
* **Technical Dependencies:**  
  * Local Llama 3 (8B) or Claude platform api integration.  
  * Nomic-embed-text for vectorizing open-text responses.  
  * Database schema update to store conversation transcripts and dynamic desire tags.  
* **Verification Criteria:**  
  * **Positive:** A user inputs a narrative response (e.g., "I get tense after work and need physical touch to unwind"); the AI dynamically extracts "Brakes: High stress" and "Accelerators: Physical touch" and prompts a valid, context-aware follow-up question.  
  * **Negative:** A user inputs a completely off-topic or empty string; the AI identifies the input as invalid, prompts with a soft, trauma-informed re-direct, and does not exhaust local token context.

# **Sprint 8: Generative Date Nights Engine**

**Epic: Context-Aware AI Itinerary Builder**

* **Milestone Goals:** Build the real-time "Vibe Check" intake system and generative date night itinerary builder that dynamically structures 15-minute intimacy plans.  
* **User Stories:**  
  * *As a couple,* we want to input our immediate energy level and time limit, so that the AI generates a customized, low-friction intimacy activity on the fly.  
  * *As a partner,* I want the AI-generated scripts to dynamically incorporate our names, preferred pronouns, and pre-screened fantasies to ensure a comfortable and inclusive experience.  
* **Technical Dependencies:**  
  * Somatic script templates database.  
  * LLM-based prompt library for script generation with strict system guardrails to prevent explicit/unsafe content.  
* **Verification Criteria:**  
  * **Positive:** Inputting "20 minutes, Low Energy, High Emotional Intimacy" successfully outputs a three-step guided date night focusing on breathing and soft-focus ambient eye contact, correctly using the couple's pronouns.  
  * **Negative:** Injecting explicit or harmful keywords into the Vibe Check triggers the safety guardrail system, returning a gentle "Safe Boundary" prompt and falling back to a pre-vetted static script.

# **Sprint 9: Real-Time Synced Intimacy Space & Safety Brake**

**Epic: Supabase Real-Time State Machine**

* **Milestone Goals:** Build the synchronized real-time session orchestrator to link partner devices, synchronize the active date-night timer, and execute the "Red Light" emergency brake protocol.  
* **User Stories:**  
  * *As a user,* I want the date night countdown and prompts to be synchronized in real-time with my partner's device, so that we remain aligned throughout the experience.  
  * *As a trauma survivor,* I want a highly visible "Red Light" button on my screen to instantly pause the active date night and switch both of our screens to a soothing, somatic grounding exercise.  
* **Technical Dependencies:**  
  * Supabase Realtime client integration (replacing manual WebSockets to ensure a robust, managed sync foundation).  
  * Local state store for offline synchronization support.  
* **Verification Criteria:**  
  * **Positive:** Tapping "Pause" on Partner A's screen halts the countdown timer and triggers a real-time event that forces Partner B's screen to switch to the Grounding Screen within 200ms.  
  * **Negative:** Simulated network disconnect of Partner B during an active session gracefully pauses Partner A's timer with a "Waiting for connection" status, maintaining local state on reconnection.

# **Sprint 10: Somatic Pre-Intimacy & Psychoeducation Hub**

**Epic: Nervous System Co-Regulation & Expert Education**

* **Milestone Goals:** Build the Somatic Hub, integrating progressive muscle relaxation, mutual breathing animations, and licensed expert bite-sized audio guides.  
* **User Stories:**  
  * *As a busy couple,* we want a 5-minute somatic transition exercise before starting a date, so that we can co-regulate our nervous systems and release daily stress.  
  * *As a user,* I want to listen to brief, 3-minute psychoeducational audio clips by experts on trauma-informed intimacy, so that I can normalize my boundaries without shame.  
* **Technical Dependencies:**  
  * Web Audio API, React SVG Lottie animation library for breathing guide.  
  * JSON metadata models for audio/text resource delivery.  
* **Verification Criteria:**  
  * **Positive:** Opening a "Transition Activity" launches a synchronized breathing circle animation, and the progress bar records mutual completion in SQLite.  
  * **Negative:** Playing audio clips under low-bandwidth conditions caches the asset or falls back cleanly to a responsive text transcript.

# **Sprint 11: Reinforcement Learning Loop & E-Commerce Integration**

**Epic: Smart Curation Feedbacks & Partner Product Matching**

* **Milestone Goals:** Build the post-date "Afterglow" survey analysis engine and the smart affiliate shopping integration.  
* **User Stories:**  
  * *As a user,* I want to rate my date night in a 3-question survey, so that the AI learns what worked and never recommends an activity that triggered me or my partner.  
  * *As a couple,* we want tailored recommendations for body-safe, LGBTQ+-friendly intimacy products (e.g. massage oils) based on our matched desires, with direct affiliate purchase links.  
* **Technical Dependencies:**  
  * Feedback scoring matrix database schema.  
  * Affiliate product database, security hashing of outbound tracking links.  
* **Verification Criteria:**  
  * **Positive:** Rating an activity 1/10 for Brakes triggers a database rewrite that blacklists similar tags from future generative date nights. Matching on "Temperature Play" displays an affiliate link to a vetted, premium warming massage candle.  
  * **Negative:** Disabling the partner's access instantly scrubs or hashes any shared feedback records to prevent data exposure.

# **Sprint 12: Release Signoff Board & Local Outbox Export**

**Epic: Release Verification**

* **Milestone Goals:** Design the comprehensive, local-first signoff checker and the release packager to export local assets.  
* **Verification:** Export packaging compiles successfully with markdown signoff documents.

