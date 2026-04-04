# Frontend Implementation Details: User Profile

This document details the frontend implementation specifics for the User Profile section of the Versa application, derived from the "Frontend UI & Component Architecture: User Profile" document.

## 1. Component Structure

The architecture is built upon a modular, component-based approach:

### 1.1. Layout Components
*   **`AppLayout`**: Manages overall application layout (header, footer, navigation). Dynamically renders navigation based on authentication status.
*   **`AuthLayout`**: Provides a specific layout for authentication pages (Login, Register), potentially including branding and centering.

### 1.2. Page Components (Containers/Smart Components)
These handle state management, data fetching, and orchestrate UI components.
*   **`LoginPage`**:
    *   **Responsibility**: User authentication.
    *   **State**: Manages login form (email, password).
    *   **Actions**: Handles form submission, calls `POST /api/v1/auth/login`. Manages loading/error states. Redirects on success.
*   **`RegisterPage`**:
    *   **Responsibility**: User registration.
    *   **State**: Manages registration form (name, email, password).
    *   **Actions**: Handles form submission, calls `POST /api/v1/auth/register`. Manages loading/error states. Redirects on success.
*   **`ProfilePage`**:
    *   **Responsibility**: Displaying and updating authenticated user's profile.
    *   **Data Fetching**: Fetches user data on mount (`GET /api/v1/user/profile`).
    *   **State**: Manages profile form (name, email), loading, error, and success states.
    *   **Actions**: Handles profile update submission (`PATCH /api/v1/user/profile`).

### 1.3. UI Components (Presentational/Dumb Components)
Reusable, stateless components focused on rendering UI based on props.
*   **`LoginForm`**: Renders email/password inputs and submit button. Receives `onSubmit`, `onChange`, `formData`, `isLoading`, `error` as props.
*   **`RegisterForm`**: Renders name, email, password inputs and submit button. Receives `onSubmit`, `onChange`, `formData`, `isLoading`, `error` as props.
*   **`ProfileViewForm`**: Renders name/email inputs, "Edit"/"Save" buttons. Receives `onSubmit`, `onChange`, `formData`, `isEditing`, `isLoading`, `error`, `successMessage` as props.
*   **`InputField`**: Generic input (label, type, value, onChange, placeholder, error).
*   **`Button`**: Generic button (text, onClick, isLoading, disabled, variant).
*   **`LoadingSpinner`**: Visual loading indicator.
*   **`ErrorMessage`**: Displays error messages.
*   **`SuccessMessage`**: Displays success notifications.

## 2. Data Binding and State Management

### 2.1. Authentication State
*   **Management**: Global (e.g., React Context, Redux).
*   **Content**: `isAuthenticated` (boolean), `authToken` (string), `user` (object: {userId, email, name}).
*   **Updates**: On successful login/registration and logout. `authToken` securely stored (e.g., HTTP-only cookies).

### 2.2. User Profile Data
*   **Fetching**: By `ProfilePage` on mount.
*   **Storage**: Component local state or dedicated profile store.
*   **Updates**: API calls (PATCH) trigger re-fetching or local state update.

### 2.3. Form State
*   **Management**: Locally within `LoginPage`, `RegisterPage`, and `ProfilePage`.
*   **Implementation**: Controlled components for input fields.

### 2.4. Error/Loading States
*   **Management**: Locally within page components and passed down via props to UI components.

## 3. Interaction Logic

### 3.1. User Authentication (Login/Registration)
*   **Form Input**: Users interact with `InputField` components within `LoginForm`/`RegisterForm`. Changes update local form state in `LoginPage`/`RegisterPage`.
*   **Submission**: Clicking `Button` in `LoginForm`/`RegisterForm` triggers `onSubmit` in `LoginPage`/`RegisterPage`.
*   **API Calls**: `LoginPage`/`RegisterPage` make `POST` requests to `/api/v1/auth/login` or `/api/v1/auth/register`.
*   **State Updates**: `isLoading` set during API call. On success, `isAuthenticated` and `authToken` are updated globally, and user is redirected. On failure, `error` state is updated, displayed via `ErrorMessage`.

### 3.2. User Profile Viewing/Editing
*   **Data Fetching**: On `ProfilePage` mount, `GET /api/v1/user/profile` is called. `isLoading` is active.
*   **Display**: Fetched user data (`name`, `email`) is bound to `ProfileViewForm` inputs.
*   **Editing**: Clicking "Edit" button (within `ProfileViewForm`) toggles `isEditing` state, enabling input fields.
*   **Form Input**: Changes to `InputField`s within `ProfileViewForm` update local profile form state.
*   **Saving**: Clicking "Save" button triggers `onSubmit` in `ProfilePage`, making a `PATCH /api/v1/user/profile` call.
*   **State Updates**: `isLoading` active during update. On success, `successMessage` displayed via `SuccessMessage`. On failure, `error` state updated via `ErrorMessage`.
Profile data may be re-fetched or local state updated.

### 3.3. Error Handling
*   **Client-Side Validation**: Implemented for immediate feedback on form fields (e.g., email format, required fields).
*   **API Error Mapping**: Backend error codes are mapped to user-friendly messages for display via `ErrorMessage` or notifications/toasts.
*   **Global Error Boundaries**: Catch unexpected UI errors.
