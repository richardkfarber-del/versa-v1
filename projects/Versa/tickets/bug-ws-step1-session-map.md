# Step 1: Initialize Session Map and Message Parser

**Assignee:** Lucius
**File:** `/app/workspace/projects/Versa/src/backend/src/active_date/websocket.js`

**Instructions:**
1. At the top of the file or outside the connection handler, add a new map to track sessions: `const sessions = new Map();`
2. Inside the WebSocket connection handler, add a basic message parser for incoming messages.
3. Add a listener for the `startTimer` message type. Do NOT implement the actual timer logic yet—just parse the message and `console.log` that `startTimer` was received.

Keep it simple. Do not add interval logic yet.