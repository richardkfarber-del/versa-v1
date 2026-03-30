# Versa MVP: Product Outline & Backlog

## 1. Core User Flows

* **Onboarding & Partner Linking:** Users create an account and securely link their profile with their partner via an invite code to enable cross-referencing.
* **The Connection Compass (Quiz Flow):** Each partner independently navigates a static, multiple-choice assessment covering their Brakes, Accelerators, Attachment needs, and Boundaries.
* **Blind Matching (Dashboard Flow):** The system cross-references both completed quizzes and populates a dashboard that exclusively reveals areas where both partners answered "Yes" or "Maybe".
* **15-Minute Date Nights (Engagement Flow):** Users browse a library of 20-30 pre-written date night itineraries. Free users encounter a paywall for premium scripts ($5/month). Once a date is launched, the step-by-step guide begins.
* **Safety & Aftercare Flow:** During any active date night, a highly visible "Red Light" button remains on-screen. Pressing it pauses the session and launches a grounding exercise. After the date concludes, both partners are routed to a 3-question "Afterglow" survey.
* **Nudges & Gentle Reminders (Notification Flow):** If one partner finishes a task (like the Connection Compass) and the other hasn't, the active user can send a system-generated, low-pressure "nudge." The system also handles automated reminders for scheduled date nights.
* **Content Discovery & Filtering (Library Flow):** Users browse the date night library but need to sort options based on their current capacity. They can filter by tags such as "Low Energy," "High Intimacy," or "Conversation Focused" to find an itinerary that matches their immediate mood.
* **Profile Evolution & Privacy (Settings Flow):** Users are not locked into their initial quiz answers. They can navigate to their settings to update their Brakes, Accelerators, or Boundaries. If the relationship ends or they want to revoke data access, they can sever the partner link instantly.

---

## 2. MVP User Stories

### User Story: Partner Account Linking
**Description:** As a user, I want to securely invite and link my profile with my partner's so that the system can cross-reference our data for blind matching.
**Acceptance Criteria:**
*Scenario: Linking accounts via invite code*
* **Given** a user is logged into the app and navigates to the partner linking screen
* **When** the user generates an invite code and the partner inputs it into their application
* **Then** the system should securely link both profiles in the database and unlock the matching dashboard.

### User Story: The Connection Compass Quiz
**Description:** As a user, I need to take a multiple-choice desire quiz covering Brakes, Accelerators, Attachment, and Boundaries so the system can map my intimacy blueprint.
**Acceptance Criteria:**
*Scenario: Completing the static quiz*
* **Given** a user navigates to the Connection Compass
* **When** the user answers all multiple-choice questions and submits the form
* **Then** the system should save the responses to the user's profile and update their status to "Quiz Completed."

### User Story: Blind Matching Logic
**Description:** As a user, I want to see only the desires and boundaries that both my partner and I answered "Yes" or "Maybe" to, so that I can explore new ideas without the fear of rejection.
**Acceptance Criteria:**
*Scenario: Revealing matched preferences*
* **Given** a user and their linked partner have both completed the Connection Compass
* **When** a user views the matching dashboard
* **Then** the system should only display the overlapping "Yes" or "Maybe" answers and strictly hide any conflicting or "No" answers.

### User Story: 15-Minute Date Nights & Paywall
**Description:** As a user, I want to access a library of 15-minute date night itineraries, with a premium subscription unlocking the fully curated scripts.
**Acceptance Criteria:**
*Scenario: Accessing a premium date night itinerary*
* **Given** a user operates on the freemium tier and attempts to open a locked 15-minute date night
* **When** the user clicks on the premium session
* **Then** the system should display a subscription paywall prompt for $5/month.

*Scenario: Viewing an unlocked itinerary*
* **Given** a user is subscribed to the premium tier
* **When** the user clicks on a session
* **Then** the system should initiate the step-by-step text/audio guide for the date night.

### User Story: The Digital Safe Word
**Description:** As a user, I want a highly visible "Red Light" button on every screen during a date night to instantly pause the session and trigger a grounding exercise if I feel overwhelmed.
**Acceptance Criteria:**
*Scenario: Triggering the safe word*
* **Given** a user is actively engaged in a 15-minute date night session
* **When** the user presses the "Red Light" button
* **Then** the application should instantly hide the itinerary text and immediately display a somatic grounding exercise.

### User Story: The Afterglow Survey
**Description:** As a user, I want to complete a simple 3-question survey at the end of a date night so that my feedback is recorded for future curation.
**Acceptance Criteria:**
*Scenario: Submitting post-date feedback*
* **Given** a user has completed or manually ended a date night session
* **When** the session concludes
* **Then** the application should display a 3-question "Afterglow" survey
* **And** the system should save the submitted feedback to the user's profile upon completion.

### User Story: Partner Nudge Notifications
**Description:** As a user, I want the ability to send a gentle, system-generated nudge to my partner so they are reminded to complete their Connection Compass without feeling personally pressured.
**Acceptance Criteria:**
*Scenario: Sending a nudge to a linked partner*
* **Given** a user has completed their Connection Compass but their linked partner has not
* **When** the user clicks the "Nudge Partner" button on the dashboard
* **Then** the system should send a pre-written push notification to the partner's device with a soft, encouraging reminder.

### User Story: Date Night Filtering
**Description:** As a user, I want to filter the 15-Minute Date Nights library by energy level and focus area so we can find an activity that matches our current physical and emotional capacity.
**Acceptance Criteria:**
*Scenario: Filtering the library by energy level*
* **Given** a user is browsing the Date Night library
* **When** the user applies an "Energy Level: Low" filter
* **Then** the system should only display date night itineraries tagged as low energy or relaxing.

### User Story: Updating the Connection Compass
**Description:** As a user, I want to update my Connection Compass quiz answers at any time so that my evolving boundaries and desires are accurately reflected in the matching logic.
**Acceptance Criteria:**
*Scenario: Updating quiz answers*
* **Given** a user is viewing their personal profile settings
* **When** the user selects "Update Connection Compass", modifies their previous answers, and saves
* **Then** the system should immediately recalculate the overlapping matches on the shared Blind Matching dashboard based on the new data.

### User Story: Unlinking a Partner
**Description:** As a user, I want the ability to instantly unlink from my current partner so that my data is no longer shared and I retain full control over my profile privacy.
**Acceptance Criteria:**
*Scenario: Severing the partner link*
* **Given** a user is logged in and navigates to the relationship settings
* **When** the user selects and confirms the "Unlink Partner" action
* **Then** the system should immediately sever the connection, disable the shared matching dashboard for both accounts, and restrict all future data sharing.

### User Story: In-App Date Scheduling
**Description:** As a user, I want to schedule a chosen date night itinerary for a specific day and time so that my partner and I have a committed window for connection.
**Acceptance Criteria:**
*Scenario: Scheduling a date night*
* **Given** a user has selected an unlocked 15-minute date night itinerary
* **When** the user inputs a future date and time and confirms the schedule
* **Then** the system should log the upcoming date night on both partners' dashboards and schedule a reminder push notification for both devices 15 minutes prior to the start time.

---

## 3. Admin & Content-Creator Flows

* **Content Management & Publishing (Library Flow):** Admins need a portal to draft, format, and publish the 15-minute date night itineraries. This includes assigning metadata (tags for filtering) and determining if a date is free or locked behind the premium subscription.
* **The Connection Compass Matrix (Assessment Flow):** The psychological and emotional assessment tool must be adaptable. Admins need the ability to add, edit, or remove questions within the Brakes, Accelerators, Attachment, and Boundaries categories to refine the matching algorithm over time.
* **User & Subscription Moderation (Support Flow):** A basic CRM interface is required to view active accounts, monitor the health of the application (e.g., number of linked couples vs. solo users), and manage premium subscription statuses or billing errors.

---

## 4. Admin User Stories

### User Story: Date Night Creation and Publishing
**Description:** As a content creator, I want to draft, format, and publish new 15-minute date night itineraries so the user-facing library remains fresh and engaging.
**Acceptance Criteria:**
*Scenario: Publishing a new itinerary*
* **Given** an admin is logged into the content management dashboard
* **When** the admin inputs the date night title, step-by-step instructions, and selects "Publish"
* **Then** the system should save the new itinerary to the database and immediately display it in the live Date Night library.

### User Story: Itinerary Tagging and Categorization
**Description:** As a content creator, I want to apply specific tags to date nights so that users can accurately filter the library based on their current physical or emotional capacity.
**Acceptance Criteria:**
*Scenario: Assigning tags to a date night*
* **Given** an admin is creating or editing a date night itinerary
* **When** the admin assigns predefined tags such as "Low Energy" or "Conversation Focused" and saves the changes
* **Then** the system should associate those tags with the itinerary and make it discoverable under those specific user filters.

### User Story: Premium Content Paywall Toggling
**Description:** As an admin, I want to toggle the premium status of specific date nights so I can easily control which content is offered for free and which is locked behind the subscription.
**Acceptance Criteria:**
*Scenario: Unlocking a premium itinerary for a promotion*
* **Given** an admin navigates to the date night inventory list
* **When** the admin toggles the "Premium" flag on a specific itinerary from active to inactive
* **Then** the system should instantly remove the paywall for that itinerary, making it accessible to all free-tier users.

### User Story: Connection Compass Question Management
**Description:** As an admin, I want to add or modify questions in the Connection Compass so the assessment tool can evolve based on psychological best practices and user feedback.
**Acceptance Criteria:**
*Scenario: Adding a new boundary question*
* **Given** an admin is managing the Connection Compass matrix
* **When** the admin adds a new multiple-choice question to the "Boundaries" category and deploys the update
* **Then** the system should include the new question in all future assessments and display an "Update Available" notification to existing users.

### User Story: Basic User & Subscription Moderation
**Description:** As an admin, I want to view high-level user profiles and subscription statuses so I can provide customer support and troubleshoot account linking or billing issues.
**Acceptance Criteria:**
*Scenario: Verifying a user's premium status*
* **Given** an admin is logged into the user moderation dashboard
* **When** the admin searches for a specific account via email address
* **Then** the system should display the account's current subscription tier, partner linking status, and basic profile metadata without revealing their private Connection Compass answers.

---

## 5. Tech Tickets: Empty States & Edge Cases

### Tech Ticket: Dashboard Empty States
**Description:** The system needs user-friendly fallback screens for when data is pending, so the user isn't staring at a blank screen while waiting for their partner.
**Acceptance Criteria:**
* Display a "Waiting for Partner" graphic and a "Copy Invite Code" button on the dashboard if no partner is linked.
* Display a "Partner is Taking the Compass" status state if the partner is linked but hasn't finished their assessment.
* Ensure the Blind Matching data is strictly hidden until both users have a "Quiz Completed" status.

### Tech Ticket: Error Handling & Invalid Codes
**Description:** The application needs graceful error handling for the onboarding and linking process to prevent users from getting stuck in a loop.
**Acceptance Criteria:**
* Display a clear inline error message if an invalid or expired partner invite code is entered.
* Provide a "Resend Code" option if the initial linking attempt times out.
* Ensure form validation prevents users from submitting an incomplete Connection Compass.

### Tech Ticket: Secure Session Management & Data Privacy
**Description:** Given the sensitive nature of the Connection Compass data, the backend requires strict security protocols for data at rest and in transit.
**Acceptance Criteria:**
* Implement robust encryption for all answers stored in the database.
* Establish secure, authenticated sessions that automatically time out after a period of inactivity.
* Ensure API endpoints strictly validate that the requesting user is authorized to view the requested partner data.