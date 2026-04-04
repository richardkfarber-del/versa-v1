
# Daily Ledger

## Failures Acknowledged - 2026-04-04

1. **Memory Leak in `websocket.js`:**
   - Created a `new WebSocket.Server` inside the `http.createServer` request handler.
   - Resulted in a massive memory leak on every connection.

2. **Red Light Emergency Brake Logic Removed:**
   - Dropped the "Red Light" emergency brake logic from the final code.
   - This omission could have resulted in critical failures under certain conditions.
