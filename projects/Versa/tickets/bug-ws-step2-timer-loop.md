# Step 2: Implement Timer Loop

**Assignee:** Lucius
**File:** `/app/workspace/projects/Versa/src/backend/src/active_date/websocket.js`

**Instructions:**
1. Locate the `startTimer` message block you created in Step 1.
2. Inside the `startTimer` block, add a `setInterval` that acts as a countdown timer.
3. The countdown should start at 900 seconds (15 minutes).
4. Save the interval ID to the `sessions` map so it can be accessed later.

Keep it simple. Only add the timer loop logic. Do not add the Red Light feature yet.