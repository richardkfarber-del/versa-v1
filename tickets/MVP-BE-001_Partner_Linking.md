### 🎫 TICKET: MVP-BE-001
**Title:** Partner Linking & Secure Session State
**Status:** CLOSED
**Assignee:** Lucius / Cyborg
**Priority:** High / P1
**App:** Versa (MVP)

**User Story:**
As a user, I want to securely connect with my partner via an invite code or QR code so we can share a private session state without merging our individual private accounts.

**Objective:**
Implement a secure, zero-knowledge, end-to-end encrypted Partner Linking system. It should securely bind "Partner A" and "Partner B" into a shared session state, preparing the system for the synchronized "Active Date Night" phase.

**Technical Requirements & Scope (MVP):**
- **Pairing Mechanism:** Develop a secure invite-code or QR-based pairing system.
- **Session State:** Establish a shared session state via WebSockets that links two users without merging their private account data.
- **Extreme Security:** The database schema and authentication flow must utilize end-to-end encryption. The plaintext of user desires or match results must not be accessible even in the event of a breach.
- **Real-Time Readiness:** Ensure the WebSocket session supports the required real-time syncing for future timer and text prompt updates.

**Deliverables Required:**
- Backend logic for generating and validating invite codes/QR payloads.
- API endpoints handling the pairing request and confirmation.
- WebSocket session management implementation for the synchronized state.
- A technical document (`partner_linking_architecture.md`) detailing the E2E encryption approach and session architecture.

**Handoff Instructions:**
Save all backend code, API documentation, and architecture notes in `/app/workspace/Versa/backend/partner_linking/`. Update the ticket status once the endpoints and WebSocket channels are operational and tested.