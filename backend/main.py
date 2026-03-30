from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import asyncio
import json
import os
from app.routes import relationship, admin, auth

app = FastAPI(title="Versa Backend")
from app.database import engine
from app.models.database import Base
Base.metadata.create_all(bind=engine)

# Register Routers
app.include_router(relationship.router)
app.include_router(admin.router)
app.include_router(auth.router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

import redis.asyncio as redis

class ConnectionManager:
    def __init__(self):
        self.active_connections: dict = {}
        self.redis = redis.from_url(os.getenv("REDIS_URL", "redis://redis:6379"), decode_responses=True)
        self.pubsub = self.redis.pubsub()
        self.task = None

    async def connect(self, websocket: WebSocket, pairing_id: str):
        await websocket.accept()
        if pairing_id not in self.active_connections:
            self.active_connections[pairing_id] = []
            await self.pubsub.subscribe(pairing_id)
            if not self.task:
                self.task = asyncio.create_task(self._listen())
        self.active_connections[pairing_id].append(websocket)

    def disconnect(self, websocket: WebSocket, pairing_id: str):
        if pairing_id in self.active_connections:
            try:
                self.active_connections[pairing_id].remove(websocket)
            except ValueError:
                pass
            if not self.active_connections[pairing_id]:
                del self.active_connections[pairing_id]

    async def _listen(self):
        async for message in self.pubsub.listen():
            if message["type"] == "message":
                channel = message["channel"]
                data = message["data"]
                if channel in self.active_connections:
                    for connection in self.active_connections[channel]:
                        try:
                            await connection.send_text(data)
                        except Exception:
                            pass

    async def broadcast(self, message: dict, pairing_id: str):
        await self.redis.publish(pairing_id, json.dumps(message))

manager = ConnectionManager()

@app.websocket("/ws/{pairing_id}")
async def websocket_endpoint(websocket: WebSocket, pairing_id: str):
    await manager.connect(websocket, pairing_id)
    try:
        while True:
            data = await websocket.receive_text()
            msg = json.loads(data)
            
            # Action Handling
            if msg.get("type") == "STOP":
                await manager.broadcast({"type": "STATE_CHANGE", "destination": "grounding"}, pairing_id)
            elif msg.get("type") == "RESUME":
                await manager.broadcast({"type": "STATE_CHANGE", "destination": "active_date"}, pairing_id)
            
            # Epic 7: Partner Nudge
            elif msg.get("type") == "SEND_NUDGE":
                await manager.broadcast({
                    "type": "PARTNER_NUDGE",
                    "sender": msg.get("sender_id"),
                    "text": "Your partner is ready when you are. Would you like to complete the Connection Compass?"
                }, pairing_id)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, pairing_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

