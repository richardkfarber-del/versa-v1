1. Project Overview

App Name: Versa

Description: A premium, trauma-informed intimacy and connection app designed for LGBTQ+ and queer couples across the entire gender and sexuality spectrum.

Core Loop: Couples link accounts, take a "blind match" desire quiz, discover overlapping interests, and are guided through synced, 15-minute date nights.

2. Core Architecture & Backend (Lucius / Cyborg)

Extreme Security (Zero-Knowledge & E2E): The app handles sensitive psychological data. The database schema and auth flow must use End-to-End encryption so the plaintext of a user's desires cannot be read even in a breach.

Partner Linking: A secure invite-code or QR-based pairing system that links "Partner A" and "Partner B" into a shared session state without merging private accounts.

The "Blind Match" Engine: An algorithm comparing Partner A's array of quiz answers (Yes/Maybe/No) against Partner B's, strictly returning only data points where both answered "Yes" or "Maybe".

Real-Time Syncing (WebSockets): The 15-minute "Active Date Nights" require a timer and text prompts synced in real-time across both devices.

AI-Ready Modularity: The MVP uses a static database of scripts, but the backend must be architected so an LLM can be easily plugged in later (Phase 2) to generate dynamic text responses based on match data.

3. UI/UX Design & Aesthetic (Green Lantern)

Vibe: "Headspace meets a luxury spa, but with vibrant energy." Safe, dreamy, modern, and high-end. Crucial: Do NOT make it look like a dating or porn app. No explicit imagery or cheap "sexy" tropes.

Colors: Dynamic, vibrant, sophisticated jewel tones (deep plum, vibrant mango, fiery orange, vivid emerald, or glowing saffron) balanced with clean off-white or deep midnight backgrounds. AVOID muted colors and standard pink/blue combos.

Typography & Imagery: Clean, modern sans-serif fonts. Imagery should rely on abstract fluid shapes, inclusive line-art, or soft-focus ambient photography (shadows, textures, intertwined hands).

4. The 5 Key Screens

The "Connection Compass": A clean, non-overwhelming questionnaire interface (Yes/Maybe/No) that feels lightweight and gamified.

The "Match Reveal": A celebratory, soft screen showing only the matched activities.

The Active Date Night: A timer-based interface guiding the couple through the 15-minute activity.

The "Digital Safe Word" (Crucial): A highly visible "Red Light" or "Pause" button on the Active Date Night screen acting as a trauma-informed emergency brake.

The "Grounding" Screen: Instantly appears if the Red Light is pressed, shifting to a soothing color and displaying a simple breathing exercise graphic via WebSocket event.