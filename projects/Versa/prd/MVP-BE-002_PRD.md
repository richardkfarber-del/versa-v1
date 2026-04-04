# PRD: The "Blind Match" Engine (MVP-BE-002)

## 1. Overview
This document specifies the technical requirements for the "Blind Match" engine, a core backend component for the Versa MVP. The engine's primary purpose is to compare quiz results from two linked partners and return only their overlapping interests, ensuring user privacy and data security.

## 2. User Story
As a paired user, I want to securely take a desire quiz and only discover the overlapping interests (where both partners answered "Yes" or "Maybe") to ensure my private boundaries and unshared desires are protected.

## 3. Technical Requirements

### 3.1. Data Model & Schema
- A new table, `quiz_answers`, will be created.
- **Fields:**
    - `answer_id` (Primary Key, UUID)
    - `session_id` (Foreign Key to shared session from MVP-BE-001)
    - `user_id` (Foreign Key to user)
    - `quiz_id` (Identifier for the specific quiz version)
    - `answers` (Encrypted JSON/blob): Stores an array of the user's answers (e.g., `[{question_id: 'q1', answer: 'yes'}, ...]`). Encryption must leverage the E2E architecture from `MVP-BE-001`.

### 3.2. "Blind Match" Algorithm
- The core logic will be a function that accepts two encrypted answer arrays as input (one for Partner A, one for Partner B).
- The function must decrypt the arrays in memory for processing.
- It will iterate through the answers and identify questions where **both** partners answered "Yes" or "Maybe".
- The function will return a new array containing only the `question_id`s for the matched desires.
- **Crucially:** No other data (unmatched "Yes"/"Maybe" answers, or any "No" answers) should be exposed or returned. Plaintext data should not be held in memory longer than necessary.

### 3.3. API Endpoints
Two primary endpoints are required:

**1. `POST /api/v1/quiz/submit`**
   - **Purpose:** Allows a user to submit their completed quiz answers.
   - **Auth:** Requires an active, paired user session.
   - **Request Body:**
     ```json
     {
       "quiz_id": "vers_compass_v1",
       "answers": [
         { "question_id": "q1", "answer": "yes" },
         { "question_id": "q2", "answer": "no" },
         { "question_id": "q3", "answer": "maybe" }
       ]
     }
     ```
   - **Response:**
     - `201 Created` on successful save.
     - `400 Bad Request` for validation errors.
     - `401 Unauthorized` if not authenticated/paired.

**2. `GET /api/v1/matches`**
   - **Purpose:** Allows a user to retrieve the results of the blind match.
   - **Auth:** Requires an active, paired user session.
   - **Logic:** This endpoint will trigger the "Blind Match" Algorithm. It should first check if *both* partners have submitted their answers for the given `quiz_id`.
   - **Response:**
     - `200 OK` with the list of matched `question_id`s if both partners have submitted.
       ```json
       {
         "quiz_id": "vers_compass_v1",
         "matches": ["q1", "q3"]
       }
       ```
     - `202 Accepted` if the current user has submitted but their partner has not.
     - `404 Not Found` if the current user has not submitted a quiz yet.

## 4. Deliverables
1. **Backend Code:** Implementation of the algorithm and API endpoints.
2. **Database Schema:** SQL migration script for the `quiz_answers` table.
3. **Unit Tests:** Tests to verify the matching logic, especially the privacy filtering of non-overlapping answers.
4. **Handoff Location:** All code and documentation to be saved in `/app/workspace/Versa/backend/blind_match/`.
