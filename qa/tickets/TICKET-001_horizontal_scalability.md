# TICKET-001: Horizontal Scalability Limit

**Risk Identified:** The in-memory `sessions = new Map()` restricts the application to a single Node.js instance.

**Phase II Requirement:** To support horizontal scaling, a pub/sub mechanism (e.g., Redis) must be implemented to synchronize WebSocket states across multiple instances. This will allow the application to handle a larger number of concurrent users.
