# User Story: User Login & Authentication

## Description
As a user, I want to be able to log into my account using my email and password securely, with the option to stay logged in and toggle password visibility, so that I can access my personalized dashboard and features.

## Functional Requirements

### 1. Email and Password Authentication
- The system shall provide a login form with fields for 'Email Address' and 'Password'.
- The 'Email Address' field must validate that the input is a correctly formatted email address.
- The 'Password' field shall mask the input by default for security.
- The system shall authenticate the user against the stored credentials upon clicking the 'Login' button.

### 2. Password Visibility Toggle
- The system shall include an interactive icon (e.g., an eye icon) within the password field.
- Clicking the toggle shall switch the password field between 'masked' (bullets/asterisks) and 'plain text' modes.

### 3. 'Remember Me' Functionality
- The system shall provide a 'Remember Me' checkbox.
- If checked, the system shall issue a persistent authentication token (e.g., via a long-lived cookie) to keep the user logged in across browser sessions until they explicitly log out.

### 4. Basic Error Handling
- The system shall display a generic error message (e.g., "Invalid email or password") if authentication fails.
- The system shall not specify whether the email or the password was the incorrect component to prevent account enumeration attacks.
- The system shall provide a visual indication if mandatory fields are left empty.

## Acceptance Criteria

### AC 1: Successful Login
- **Given** I am on the login page
- **When** I enter a valid registered email and the correct password
- **And** I click 'Login'
- **Then** I should be redirected to the user dashboard and a successful session should be established.

### AC 2: Password Visibility Toggle
- **Given** I have entered text into the password field
- **When** I click the visibility toggle icon
- **Then** the password characters should become visible as plain text
- **And** when I click it again, they should be masked.

### AC 3: Remember Me Persistent Session
- **Given** I have checked the 'Remember Me' box during login
- **When** I successfully log in, close the browser, and return to the application URL
- **Then** I should still be authenticated and taken directly to the dashboard without being prompted for credentials.

### AC 4: Failed Authentication Handling
- **Given** I enter an email that is not registered or an incorrect password
- **When** I click 'Login'
- **Then** the system should display an error message "Invalid email or password" and remain on the login page.

### AC 5: Input Validation
- **Given** I leave the email or password field empty
- **When** I click 'Login'
- **Then** the system should highlight the missing fields and prevent form submission.
