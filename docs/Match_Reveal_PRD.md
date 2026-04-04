# Product Requirements Document: Match Reveal Screen

## 1. Metadata
- **Feature Name:** Match Reveal
- **Ticket Reference:** MVP-UI-002
- **Product:** Versa (MVP)
- **Priority:** High / P1

## 2. Overview
The **Match Reveal** screen is a core post-assessment interface in the Versa app. It appears immediately after both partners have completed the "Connection Compass" questionnaire. Its primary objective is to act as a soft, celebratory reveal of shared interests, allowing partners to focus on mutual desires without exposing unmatched preferences (preventing feelings of rejection or vulnerability).

## 3. User Stories
- **Primary User Story:** As a user, I want to see only the activities where both my partner and I answered "Yes" or "Maybe" so we can focus on shared desires without feeling rejected or exposed.

## 4. Functional Requirements
### 4.1. Core Matching Logic
- The system must evaluate the responses from both Partner A and Partner B.
- **Match Condition:** An activity is considered a "Match" **only** if both partners answered with either "Yes" or "Maybe".
- **Filtering:** Any activity where at least one partner answered "No" must be strictly excluded from the results payload sent to the client.

### 4.2. Interface Elements
- **Header:** A celebratory but soothing title (e.g., "Your Shared Desires").
- **Match List/Grid:** A visually pleasing display of matched activities.
    - Each item should display the activity name and optionally a representative icon or abstract visual.
- **Call to Action (CTA):** A clear button to proceed to the "Active Date Night" phase (e.g., "Plan Date Night" or "Continue").

## 5. Non-Functional Requirements (UI/UX & Aesthetics)
- **Vibe/Aesthetic:** "Headspace meets a luxury spa." Safe, dreamy, modern, and high-end. Explicitly avoid standard dating or porn app tropes.
- **Color Palette:** Vibrant jewel tones against midnight or clean off-white backgrounds.
- **Typography:** Clean, modern sans-serif fonts.
- **Imagery:** Abstract fluid shapes, inclusive line-art, or soft-focus ambient photography.

## 6. Technical & Architecture Considerations
- **Privacy/Security:** Responses must be computed securely on the backend. The frontend should only ever receive the intersection/matched list, never the raw individual responses of the partner.
- **State Management:** The screen must handle loading states (while polling or waiting for the partner to finish) and empty states (in the unlikely event of 0 matches, requiring a delicate fallback message).

## 7. Deliverables & Handoff
- Design assets and HTML/CSS mockups are to be generated in `/app/workspace/Versa/UI_Designs/Match_Reveal/`.
- UI Design notes to be stored in `match_reveal_design_notes.md` detailing colors, typography, and states.
