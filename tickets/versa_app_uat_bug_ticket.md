# UAT Bug Ticket: Versa App - Incorrect Initial Screen Routing

**Date:** 2026-03-30

**Reported By:** Master Wayne (via Oracle subagent)

## 1. Issue Description

During User Acceptance Testing (UAT) of the Versa app (v1), a critical bug has been identified. Upon launching the application, users are incorrectly routed directly to the 'Forgot Your Password' screen. From this screen, users are unable to navigate to any other application screens, effectively soft-locking them and preventing access to core functionalities like login or sign-up.

## 2. Steps to Reproduce

1. Launch the Versa application (v1).
2. Observe the initial screen displayed.

## 3. Expected Behavior

Upon initial launch, the Versa app (v1) should present the 'Login' screen as the primary entry point. Users should then have clear options to navigate to 'Sign Up' or 'Forgot Your Password' from the 'Login' screen.

## 4. Actual Behavior

Upon initial launch, the Versa app (v1) immediately displays the 'Forgot Your Password' screen. There are no navigable options to proceed to the 'Login' or 'Sign Up' screens, rendering the application unusable.

## 5. Correct Application Screen Flow (v1)

The intended and correct order of screen presentation and navigation for the Versa app (v1) is as follows:

1.  **Splash Screen / Loading Screen** (briefly displayed on app launch, if applicable)
2.  **Login Screen** (Primary entry point)
    *   From here, users should be able to:
        *   Enter credentials and log in.
        *   Navigate to the **Sign Up Screen** (e.g., via a "Create Account" or "New User" link/button).
        *   Navigate to the **Forgot Your Password Screen** (e.g., via a "Forgot Password?" link/button).
3.  **Sign Up Screen**
    *   Allows new users to create an account.
    *   Should have an option to navigate back to the **Login Screen**.
4.  **Forgot Your Password Screen**
    *   Allows users to initiate a password reset process.
    *   Should have an option to navigate back to the **Login Screen**.
5.  **Password Reset Confirmation Screen** (after submitting a password reset request from 'Forgot Your Password')
    *   Informs the user that instructions have been sent.
    *   Should have an option to navigate back to the **Login Screen**.
6.  **Home Screen / Dashboard** (after successful login)

## 6. Priority

High - This bug prevents users from accessing the application and its core features.

## 7. Affected Version

Versa App v1

## 8. Environment

UAT Environment