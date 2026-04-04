# Backend Implementation Outline: User Onboarding and Account Creation

Based on the architectural and technical design document for Versa's user onboarding and account creation, this document outlines the backend implementation details, including specific API routes, data validation, and necessary utility functions.

## 1. API Routes and Handlers

The following API routes will be implemented, each handled by a dedicated controller function responsible for processing the request, interacting with services, and sending a response.

### `POST /api/register`
*   **Purpose:** Register a new user with email and password.
*   **Handler:** `registerUser(req, res)`
    *   **Input:** `email` (string), `password` (string)
    *   **Logic:**
        1.  Validate input (email format, password complexity).
        2.  Check if email already exists.
        3.  Hash the password using bcrypt/Argon2.
        4.  Generate a unique email verification token with an expiration.
        5.  Save user to database (`email_verified=false`, `verification_token`, `verification_token_expires_at`).
        6.  Send verification email via ESP.
        7.  Return success message.

### `POST /api/login`
*   **Purpose:** Authenticate a user and provide a session token.
*   **Handler:** `loginUser(req, res)`
    *   **Input:** `email` (string), `password` (string)
    *   **Logic:**
        1.  Validate input (email format).
        2.  Retrieve user by email.
        3.  Check if user exists and email is verified.
        4.  Compare provided password with stored hash.
        5.  If credentials are valid, generate a JWT token.
        6.  Return JWT token and basic user details.

### `GET /api/verify-email?token={token}`
*   **Purpose:** Verify a user's email address using a token.
*   **Handler:** `verifyEmail(req, res)`
    *   **Input:** `token` (string, query parameter)
    *   **Logic:**
        1.  Validate token presence.
        2.  Find user by `verification_token`.
        3.  Check if token is valid and not expired.
        4.  Update user record: `email_verified=true`, clear `verification_token` and `verification_token_expires_at`.
        5.  Return success message or redirect to frontend success page.

### `POST /api/forgot-password`
*   **Purpose:** Request a password reset link for a given email.
*   **Handler:** `requestPasswordReset(req, res)`
    *   **Input:** `email` (string)
    *   **Logic:**
        1.  Validate input (email format).
        2.  (Security measure) Always return a generic success message to prevent email enumeration.
        3.  If email exists, generate a unique `password_reset_token` with an expiration.
        4.  Save token and expiration to user record.
        5.  Send password reset email via ESP.

### `POST /api/reset-password`
*   **Purpose:** Set a new password using a reset token.
*   **Handler:** `resetPassword(req, res)`
    *   **Input:** `token` (string), `new_password` (string)
    *   **Logic:**
        1.  Validate input (token presence, new password complexity).
        2.  Find user by `password_reset_token`.
        3.  Check if token is valid and not expired.
        4.  Hash the `new_password`.
        5.  Update user record with new password hash, clear `password_reset_token` and `password_reset_token_expires_at`.
        6.  Return success message.

## 2. Data Validation

Strict server-side validation will be applied to all incoming data.

### General Validation Principles
*   **Schema Validation:** Use a library (e.g., Joi, Yup, Zod for Node.js; Pydantic for Python) to define expected request body and query parameter schemas.
*   **Sanitization:** Sanitize inputs to prevent XSS and other injection attacks.

### Endpoint-Specific Validation Rules

*   **`POST /api/register`**
    *   `email`: Required, string, valid email format, unique.
    *   `password`: Required, string, minimum 8 characters, at least one uppercase letter, one number, one special character.
*   **`POST /api/login`**
    *   `email`: Required, string, valid email format.
    *   `password`: Required, string.
*   **`GET /api/verify-email`**
    *   `token`: Required, string (query parameter).
*   **`POST /api/forgot-password`**
    *   `email`: Required, string, valid email format.
*   **`POST /api/reset-password`**
    *   `token`: Required, string.
    *   `new_password`: Required, string, minimum 8 characters, at least one uppercase letter, one number, one special character.

## 3. Utility Functions / Modules

These common functionalities will be abstracted into reusable modules or utility functions.

*   **`authUtils.js` (or similar)**
    *   `hashPassword(password: string): Promise<string>`: Hashes a plain-text password.
    *   `comparePassword(password: string, hashedPassword: string): Promise<boolean>`: Compares a plain-text password with a hashed one.
    *   `generateToken(length: number): string`: Generates a cryptographically secure random string for verification/reset tokens.
    *   `generateJwt(userId: string, email: string): string`: Generates a JWT token for authenticated users.
    *   `verifyJwt(token: string): any`: Verifies and decodes a JWT token.

*   **`emailService.js` (or similar)**
    *   `sendVerificationEmail(to: string, token: string): Promise<void>`: Sends an email verification link.
    *   `sendPasswordResetEmail(to: string, token: string): Promise<void>`: Sends a password reset link.

*   **`database.js` (or similar - ORM/ODM integration)**
    *   Functions for interacting with the `users` table (e.g., `findUserByEmail`, `createUser`, `updateUserById`, `findUserByVerificationToken`, `findUserByPasswordResetToken`).

*   **`errorHandling.js` (or similar)**
    *   Centralized error handling middleware/functions to return consistent error responses (`400 Bad Request`, `401 Unauthorized`, `404 Not Found`, `500 Internal Server Error`).

## 4. Environment Variables

Sensitive information and configurable parameters will be managed via environment variables.

*   `DATABASE_URL`: Connection string for the database.
*   `JWT_SECRET`: Secret key for signing and verifying JWT tokens.
*   `EMAIL_SERVICE_API_KEY`: API key for the Email Service Provider.
*   `EMAIL_FROM`: Sender email address for transactional emails.
*   `FRONTEND_URL`: Base URL of the frontend application for constructing verification/reset links.
*   `TOKEN_EXPIRATION_HOURS_EMAIL_VERIFICATION`: Expiration time for email verification tokens.
*   `TOKEN_EXPIRATION_HOURS_PASSWORD_RESET`: Expiration time for password reset tokens.
