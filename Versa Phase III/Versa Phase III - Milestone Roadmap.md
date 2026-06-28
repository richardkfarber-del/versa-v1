# **Versa — Milestone Roadmap (Phase III: Collaborative Execution & Operational Security Sprints)**

This document outlines a structured, 3-sprint development roadmap (Sprints 13–15) to expand Versa into a fully collaborative relationship ecosystem with enterprise-grade operational security.

Proposal Review Date: June 28, 2026  
Lead Architect: Richard Farber

# **Sprint 13: Partner Linking Gaps & Proactive Nudges**

## **Epic: Nudge & Empty State Guarding**

**Milestone Goals**  
Implement the dashboard empty state handlers, quick-copy invite codes drawers, and the automated partner reminder push-notification routes.

**User Stories**

* *As a new user,* I want to see a clear "Waiting for Partner" dashboard with my invite code, so that I can easily connect my account without staring at a blank screen.  
* *As a linked partner,* I want to send a gentle nudge notification when my partner has not completed their Connection Compass, so that they are reminded without feeling personally pressured.

**Technical Dependencies**

* Firebase Cloud Messaging (FCM) or Supabase Push client SDK.  
* React state triggers for dashboard empty states.

**Verification Criteria**

* **Positive:** A newly registered, unpaired user logs in; verify the dashboard strictly hides Blind Matching cards, displays a "Waiting for Partner" empty state, and copies their pair code with one click. Clicking "Nudge" triggers a soft push notification on their partner's paired device.  
* **Negative:** Attempting to nudge a partner who has already completed the quiz displays a disabled status and prevents the push request to save server resources.

# **Sprint 14: Shared Intimacy Calendar & Cryptographic Self-Destruct**

## **Epic: Intimacy Planner & Secure Unlinking**

**Milestone Goals**  
Build the shared scheduling calendar, date proposal boards, and the cryptographic unlinking self-destruct route.

**User Stories**

* *As a couple,* we want to schedule our 15-minute date nights on a shared in-app calendar, so that we have a committed, stress-free connection window.  
* *As a partner,* I want to sever our pairing link instantly in my settings and wipe all shared trace logs and decrypted states, so that I maintain absolute control over my data privacy.

**Technical Dependencies**

* FullCalendar React library.  
* AES-256 key purging logic in `database.js` / SQLite transactional serial operations.

**Verification Criteria**

* **Positive:** Proposing a date night logs a "Pending" event on the shared calendar; the partner accepts, and the status updates to "Confirmed". Triggering "Sever Connection" immediately logs out both devices and deletes all shared keys and paired tables from SQLite.  
* **Negative:** Trying to schedule an itinerary that is locked under the premium tier triggers the subscription paywall overlay.

# **Sprint 15: Admin Content Management & Git-Backed SQLite Replication**

## **Epic: Content Publishing & Database Sync**

**Milestone Goals**  
Build the secure admin publishing board under `/admin` and write the simple-git background auto-sync service to replicate the SQLite file.

**User Stories**

* *As an admin (Blair/Rachel),* I want to draft, tag, and publish new date itineraries and toggle paywalls on a web panel, so that I can manage content without writing code.  
* *As a developer,* I want the app database to synchronize across devices asynchronously via my private GitHub, so that we have a zero-cost collaborative team environment.

**Technical Dependencies**

* Express `/admin` route controllers and admin session tokens.  
* Node `simple-git` integration for subprocess git push/pull rebases.

**Verification Criteria**

* **Positive:** An admin adds a new "Sensory Massage" itinerary and toggles it as "Premium" in the `/admin` workspace; verify it saves to SQLite and immediately appears locked in the client library. Completing a signoff pushes the SQLite database file to GitHub in the background.  
* **Negative:** Triggering a git sync while offline catches the exception gracefully, allowing the user to operate in local-only mode.

