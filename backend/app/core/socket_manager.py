import socketio
from typing import Dict, Any

class SocketManager:
    def __init__(self):
        self.sio = socketio.AsyncServer(
            async_mode='asgi',
            cors_allowed_origins=[]
        )
        self.app = socketio.ASGIApp(self.sio, socketio_path='ws/socket.io')
        self.user_sessions: Dict[int, str] = {} # user_id -> sid

    async def connect(self, sid, environ, auth: Any):
        # In a real app, validate token from auth
        print(f"Client connected: {sid}")

    async def disconnect(self, sid):
        print(f"Client disconnected: {sid}")
        # Clean up user_sessions if necessary

    def setup_handlers(self):
        @self.sio.on("join_event")
        async def handle_join(sid, data):
            event_id = data.get("event_id")
            await self.sio.enter_room(sid, f"event_{event_id}")
            print(f"SID {sid} joined event {event_id}")

        @self.sio.on("location_update")
        async def handle_location(sid, data):
            # Broadcast location to organization room
            event_id = data.get("event_id")
            await self.sio.emit("volunteer_location", data, room=f"event_{event_id}", skip_sid=sid)

socket_manager = SocketManager()
socket_manager.setup_handlers()
