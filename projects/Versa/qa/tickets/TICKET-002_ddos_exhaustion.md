# TICKET-002: DDoS / Resource Exhaustion

**Risk Identified:** Without strict rate-limiting and connection timeouts, malicious actors could flood the server with empty WebSocket connections, eventually exhausting the Node instance's memory limit.

**Phase II Requirement:** Implement robust rate-limiting on new WebSocket connections and enforce aggressive timeouts for inactive or unauthenticated sessions. This will mitigate the risk of resource exhaustion attacks.
