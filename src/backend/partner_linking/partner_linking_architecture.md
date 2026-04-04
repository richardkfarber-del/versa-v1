# Partner Linking Architecture

## 1. Overview

This document outlines the architecture for the secure partner linking and session management system for the Versa MVP. The primary goal is to establish a secure, end-to-end encrypted (E2EE) shared session between two partners without compromising their individual account privacy.

## 2. Core Principles

- **Zero-Knowledge:** The server should know as little as possible about the users and their session. All sensitive data will be encrypted client-side.
- **End-to-End Encryption:** The communication channel and the session state itself will be encrypted. The server will not have the keys to decrypt the content.
- **Ephemeral Sessions:** Sessions are temporary and can be terminated by either partner at any time.

## 3. Pairing Flow

1.  **Partner A initiates pairing:**
    - The client generates a new local keypair (or uses an existing one).
    - The client sends a request to the server to create a new pairing session.
    - The server generates a unique, short-lived invite code (e.g., 6-digit alphanumeric) and a session ID.
    - The server stores the session ID and Partner A's public key.
    - The server returns the invite code and session ID to Partner A.

2.  **Partner A shares the invite code/QR code with Partner B.**

3.  **Partner B accepts the invitation:**
    - Partner B's client generates its own keypair.
    - Partner B enters the invite code.
    - The client sends the invite code and Partner B's public key to the server.

4.  **Server validates the invite code:**
    - The server looks up the session ID associated with the invite code.
    - If the code is valid and the session is not yet paired, the server stores Partner B's public key.
    - The server notifies both clients (via WebSocket) that the pairing is successful and provides the other partner's public key.

5.  **E2EE Channel Establishment:**
    - Both clients now have each other's public keys.
    - They can now establish a secure, E2EE communication channel using a key exchange algorithm (e.g., ECDH).
    - All subsequent communication and shared state updates will be encrypted with the shared secret.

## 4. WebSocket Session Management

- Once paired, both partners are connected to the same WebSocket channel, identified by the session ID.
- The server's role is to relay encrypted messages between the two partners. It cannot read the content of the messages.
- The shared session state is managed client-side and synchronized between the two partners. The server only sees encrypted blobs of data.

## 5. Security Considerations

- **Invite Code Expiration:** Invite codes should have a short lifespan (e.g., 5-10 minutes) to minimize the risk of unauthorized use.
- **Rate Limiting:** The API endpoints for creating and accepting invitations should be rate-limited to prevent brute-force attacks.
- **Secure Key Storage:** Client-side keys must be stored securely on the device (e.g., using the device's keychain).
- **No plaintext data on server:** The server will never store any plaintext data related to user desires or match results. All data will be encrypted at rest and in transit.
