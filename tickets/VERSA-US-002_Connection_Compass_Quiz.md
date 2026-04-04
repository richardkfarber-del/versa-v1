# VERSA-US-002: The Connection Compass Quiz

## Epic
Core User Journey

## Description
As a user, I need to take a multiple-choice desire quiz covering Brakes, Accelerators, Attachment, and Boundaries so the system can map my intimacy blueprint.

## Design & Frontend Requirements (Green Lantern)
This feature requires UI/UX design work from Green Lantern using the Stitch MCP.
- **Objective:** Generate a responsive, step-by-step multiple-choice quiz interface for the Connection Compass.
- **Tooling:** You must use the Google Stitch MCP to generate the CSS, component layouts, and user flows.
- **Deliverables:** Generate the core screens (Quiz landing, active question step, and submission state) and save the exported frontend code to `/app/workspace/projects/Versa/src/`. Await Founder approval on the MVP Mood Board before generating the entire flow.

## Acceptance Criteria

**Scenario 1: Successful Quiz Completion**
*   **Given** a user navigates to the Connection Compass
*   **When** the user answers all multiple-choice questions across all categories and submits the form
*   **Then** the system should save the responses to the user's profile
*   **And** the system should update their status to "Quiz Completed."

**Scenario 2: Incomplete Quiz Submission**
*   **Given** a user is taking the Connection Compass
*   **When** the user attempts to submit the quiz with unanswered required questions
*   **Then** the system should prevent the submission
*   **And** the system should display a validation error prompting the user to complete the missing fields.
