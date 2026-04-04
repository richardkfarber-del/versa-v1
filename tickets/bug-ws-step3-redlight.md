# Step 3: Implement Red Light Safety Feature

**Assignee:** Lucius
**File:** `/app/workspace/projects/Versa/src/backend/src/active_date/websocket.js`

**Instructions:**
1. Add a new message listener for the `triggerRedLight` message type.
2. When `triggerRedLight` is received, retrieve the interval ID for the current session from the `sessions` map.
3. Immediately use `clearInterval()` on that interval ID to stop the countdown.
4. Broadcast an alert to the room/client that the Red Light feature was triggered.

Keep it simple. Only add the Red Light trigger logic.