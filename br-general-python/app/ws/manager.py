from dataclasses import dataclass
from datetime import datetime
from typing import Dict
import uuid

from fastapi import WebSocket


@dataclass
class WSConnection:
    id: str
    ws: WebSocket
    connected_at: datetime


class WSManager:
    def __init__(self) -> None:
        self.connections: Dict[str, WSConnection] = {}

    async def connect(self, ws: WebSocket) -> str:
        await ws.accept()

        connection_id = str(uuid.uuid4())

        self.connections[connection_id] = WSConnection(
            id=connection_id,
            ws=ws,
            connected_at=datetime.utcnow(),
        )

        print(f"[WS] connected: {connection_id}")

        return connection_id

    def disconnect(self, connection_id: str) -> None:
        if connection_id in self.connections:
            del self.connections[connection_id]
            print(f"[WS] disconnected: {connection_id}")

    async def broadcast(self, message: dict) -> None:
        for conn in list(self.connections.values()):
            await conn.ws.send_json(message)


# singleton instance used across the app
ws_manager = WSManager()
