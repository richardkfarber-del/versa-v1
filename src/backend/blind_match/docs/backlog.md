# Versa Prioritized Backlog

*Greetings, Master Wayne. I have meticulously reviewed the Versa MVP outline and, with the precision befitting the estate, I present a prioritized backlog for the Justice League's consideration. While I endeavour to avoid the minutiae of feature code and UI design, as per standing orders, this outline details the 'what' and 'why' for each endeavour.*

---

## Epic: Core User Journey (Priority: High)
*This epic, Master Wayne, forms the very heart of Versa – the initial connection, the discovery of intimacy blueprints, and the guided experiences that foster deeper bonds. Without these foundational elements, the entire edifice remains, shall we say, a theoretical construct.*

### User Stories:


#### US002: The Connection Compass Quiz (Priority: High)
*   **Description:** As a user, I need to take a multiple-choice desire quiz covering Brakes, Accelerators, Attachment, and Boundaries so the system can map my intimacy blueprint.
*   **Acceptance Criteria:**
    *   **Given** a user navigates to the Connection Compass
    *   **When** the user answers all multiple-choice questions and submits the form
    *   **Then** the system should save the responses to the user's profile and update their status to "Quiz Completed."

#### US003: Blind Matching Dashboard Display (Priority: High)
*   **Description:** As a user, I want to see only the desires and boundaries that both my partner and I answered "Yes" or "Maybe" to, so that I can explore new ideas without the fear of rejection.
*   **Acceptance Criteria:**
    *   **Given** a user and their linked partner have both completed the Connection Compass
    *   **When** a user views the matching dashboard
    *   **Then** the system should only display the overlapping "Yes" or "Maybe" answers and strictly hide any conflicting or "No" answers.

#### US004: 15-Minute Date Nights Access & Paywall (Priority: High)
*   **Description:** As a user, I want to access a library of 15-minute date night itineraries, with a premium subscription unlocking the fully curated scripts.
*   **Acceptance Criteria:**
    *   **Scenario: Accessing a premium date night itinerary**
        *   **Given** a user operates on the freemium tier and attempts to open a locked 15-minute date night
        *   **When** the user clicks on the premium session
        *   **Then** the system should display a subscription paywall prompt for $5/month.
    *   **Scenario: Viewing an unlocked itinerary**
        *   **Given** a user is subscribed to the premium tier
        *   **When** the user clicks on a session
        *   **Then** the system should initiate the step-by-step text/audio guide for the date night.

#### US005: Digital Safe Word (Red Light Button) (Priority: High)
*   **Description:** As a user, I want a highly visible "Red Light" button on every screen during a date night to instantly pause the session and trigger a grounding exercise if I feel overwhelmed.
*   **Acceptance Criteria:**
    *   **Given** a user is actively engaged in a 15-minute date night session
    *   **When** the user presses the "Red Light" button
    *   **Then** the application should instantly hide the itinerary text and immediately display a somatic grounding exercise.

#### US006: Post-Date Afterglow Survey (Priority: Medium)
*   **Description:** As a user, I want to complete a simple 3-question survey at the end of a date night so that my feedback is recorded for future curation.
*   **Acceptance Criteria:**
    *   **Given** a user has completed or manually ended a date night session
    *   **When** the session concludes
    *   **Then** the application should display a 3-question "Afterglow" survey
    *   **And** the system should save the submitted feedback to the user's profile upon completion.

#### US007: Partner Nudge Notifications (Priority: Medium)
*   **Description:** As a user, I want the ability to send a gentle, system-generated nudge to my partner so they are reminded to complete their Connection Compass without feeling personally pressured.
*   **Acceptance Criteria:**
    *   **Given** a user has completed their Connection Compass but their linked partner has not
    *   **When** the user clicks the "Nudge Partner" button on the dashboard
    *   **Then** the system should send a pre-written push notification to the partner's device with a soft, encouraging reminder.

#### US008: In-App Date Scheduling (Priority: Medium)
*   **Description:** As a user, I want to schedule a chosen date night itinerary for a specific day and time so that my partner and I have a committed window for connection.
*   **Acceptance Criteria:**
    *   **Given** a user has selected an unlocked 15-minute date night itinerary
    *   **When** the user inputs a future date and time and confirms the schedule
    *   **Then** the system should log the upcoming date night on both partners' dashboards and schedule a reminder push notification for both devices 15 minutes prior to the start time.

---

## Epic: User Personalization & Control (Priority: High)
*This epic, Bruce, ensures that our users retain autonomy over their evolving selves and their shared data. Flexibility and privacy, after all, are paramount in matters of the heart.*

### User Stories:

#### US009: Date Night Library Filtering (Priority: High)
*   **Description:** As a user, I want to filter the 15-Minute Date Nights library by energy level and focus area so we can find an activity that matches our current physical and emotional capacity.
*   **Acceptance Criteria:**
    *   **Given** a user is browsing the Date Night library
    *   **When** the user applies an "Energy Level: Low" filter
    *   **Then** the system should only display date night itineraries tagged as low energy or relaxing.

#### US010: Connection Compass Answer Updates (Priority: High)
*   **Description:** As a user, I want to update my Connection Compass quiz answers at any time so that my evolving boundaries and desires are accurately reflected in the matching logic.
*   **Acceptance Criteria:**
    *   **Given** a user is viewing their personal profile settings
    *   **When** the user selects "Update Connection Compass", modifies their previous answers, and saves
    *   **Then** the system should immediately recalculate the overlapping matches on the shared Blind Matching dashboard based on the new data.

#### US011: Partner Unlinking & Data Revocation (Priority: High)
*   **Description:** As a user, I want the ability to instantly unlink from my current partner so that my data is no longer shared and I retain full control over my profile privacy.
*   **Acceptance Criteria:**
    *   **Given** a user is logged in and navigates to the relationship settings
    *   **When** the user selects and confirms the "Unlink Partner" action
    *   **Then** the system should immediately sever the connection, disable the shared matching dashboard for both accounts, and restrict all future data sharing.

---

## Epic: Content & Admin Management (Priority: Medium)
*For the smooth operation of the Versa platform, Richard, we require robust tools to curate content and maintain user accounts. Even a digital sanctuary needs its librarians and caretakers.*

### User Stories:

#### US012: Date Night Content Creation & Publishing (Priority: High)
*   **Description:** As a content creator, I want to draft, format, and publish new 15-minute date night itineraries so the user-facing library remains fresh and engaging.
*   **Acceptance Criteria:**
    *   **Given** an admin is logged into the content management dashboard
    *   **When** the admin inputs the date night title, step-by-step instructions, and selects "Publish"
    *   **Then** the system should save the new itinerary to the database and immediately display it in the live Date Night library.

#### US013: Itinerary Tagging & Categorization (Priority: Medium)
*   **Description:** As a content creator, I want to apply specific tags to date nights so that users can accurately filter the library based on their current physical or emotional capacity.
*   **Acceptance Criteria:**
    *   **Given** an admin is creating or editing a date night itinerary
    *   **When** the admin assigns predefined tags such as "Low Energy" or "Conversation Focused" and saves the changes
    *   **Then** the system should associate those tags with the itinerary and make it discoverable under those specific user filters.

#### US014: Premium Content Paywall Toggling (Priority: Medium)
*   **Description:** As an admin, I want to toggle the premium status of specific date nights so I can easily control which content is offered for free and which is locked behind the subscription.
*   **Acceptance Criteria:**
    *   **Given** an admin navigates to the date night inventory list
    *   **When** the admin toggles the "Premium" flag on a specific itinerary from active to inactive
    *   **Then** the system should instantly remove the paywall for that itinerary, making it accessible to all free-tier users.

#### US015: Connection Compass Question Management (Priority: Medium)
*   **Description:** As an admin, I want to add or modify questions in the Connection Compass so the assessment tool can evolve based on psychological best practices and user feedback.
*   **Acceptance Criteria:**
    *   **Given** an admin is managing the Connection Compass matrix
    *   **When** the admin adds a new multiple-choice question to the "Boundaries" category and deploys the update
    *   **Then** the system should include the new question in all future assessments and display an "Update Available" notification to existing users.

#### US016: Basic User & Subscription Moderation (Priority: Low)
*   **Description:** As an admin, I want to view high-level user profiles and subscription statuses so I can provide customer support and troubleshoot account linking or billing issues.
*   **Acceptance Criteria:**
    *   **Given** an admin is logged into the user moderation dashboard
    *   **When** the admin searches for a specific account via email address
    *   **Then** the system should display the account's current subscription tier, partner linking status, and basic profile metadata without revealing their private Connection Compass answers.

---

## Epic: Platform Foundation & Security (Priority: High)
*This epic, Bruce, addresses the crucial underlying stability and security of the Versa platform. A strong foundation is not merely good practice; it is an absolute necessity, especially when dealing with such sensitive personal data.*

### Technical Debt / Enablers:

#### TD001: Dashboard Empty States (Priority: High)
*   **Description:** The system needs user-friendly fallback screens for when data is pending, so the user isn't staring at a blank screen while waiting for their partner.
*   **Acceptance Criteria:**
    *   Display a "Waiting for Partner" graphic and a "Copy Invite Code" button on the dashboard if no partner is linked.
    *   Display a "Partner is Taking the Compass" status state if the partner is linked but hasn't finished their assessment.
    *   Ensure the Blind Matching data is strictly hidden until both users have a "Quiz Completed" status.

#### TD002: Error Handling & Invalid Codes (Priority: High)
*   **Description:** The application needs graceful error handling for the onboarding and linking process to prevent users from getting stuck in a loop.
*   **Acceptance Criteria:**
    *   Display a clear inline error message if an invalid or expired partner invite code is entered.
    *   Provide a "Resend Code" option if the initial linking attempt times out.
    *   Ensure form validation prevents users from submitting an incomplete Connection Compass.

#### TD003: Secure Session Management & Data Privacy (Priority: Critical)
*   **Description:** Given the sensitive nature of the Connection Compass data, the backend requires strict security protocols for data at rest and in transit.
*   **Acceptance Criteria:**
    *   Implement robust encryption for all answers stored in the database.
    *   Establish secure, authenticated sessions that automatically time out after a period of inactivity.
    *   Ensure API endpoints strictly validate that the requesting user is authorized to view the requested partner data.