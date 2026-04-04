# TICKET-003: Orphaned Sessions

**Risk Identified:** The WebSocket `on('close')` event needs to be robust to prevent memory leaks from dropped mobile connections, which could lead to orphaned sessions consuming server memory.

**Phase II Requirement:** Implement aggressive session sweeping and cleanup logic tied to the WebSocket `on('close')` and `on('error')` events. Consider a periodic garbage collection routine to identify and remove sessions that have been inactive for an extended period.
