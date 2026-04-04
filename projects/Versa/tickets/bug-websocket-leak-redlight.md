# Bug Ticket: websocket.js Memory Leak & Missing Red Light Feature
**Assignee:** Lucius
**Severity:** CRITICAL
**File:** `/app/workspace/projects/Versa/src/backend/src/active_date/websocket.js`

## Description
There are two critical issues in the backend WebSocket implementation:
1. **Memory Leak:** A `new WebSocket.Server` instance is created inside the HTTP request handler. This spins up a new WebSocket server listener for every incoming request, which will cause rapid resource exhaustion and server crashes.
2. **Missing Safety Feature:** The "Red Light" safety feature for the active date system has been completely omitted.

## Required Action
* Fix the memory leak by moving the WebSocket server instantiation outside the request handler or handling connections appropriately.
* Re-implement the crucial "Red Light" safety feature.