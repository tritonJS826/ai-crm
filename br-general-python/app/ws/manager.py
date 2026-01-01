from dataclasses import dataclass
from datetime import datetime
from typing import Dict, Set
import uuid

from fastapi import WebSocket, WebSocketDisconnect

from app.logging import logger


@dataclass
class WSConnection:
    id: str
    ws: WebSocket
    connected_at: datetime
    user_id: str


class WSManager:
    def __init__(self) -> None:
        # all active connections
        self.connections: Dict[str, WSConnection] = {}

        # channel -> set of connection_ids
        self.channels: Dict[str, Set[str]] = {}

    async def connect(self, ws: WebSocket) -> str:
        await ws.accept()

    def connect(self, websocket: WebSocket, user_id: str) -> str:
        connection_id = str(uuid.uuid4())
        self.connections[connection_id] = WSConnection(
            id=connection_id,
            ws=websocket,
            connected_at=datetime.now(timezone.utc),
            user_id=user_id,
        )

        logger.info("[WS] connected %s", connection_id)
        return connection_id

    def disconnect(self, connection_id: str) -> None:
        if connection_id not in self.connections:
            return

        # remove from channels
        for subscribers in self.channels.values():
            subscribers.discard(connection_id)

        del self.connections[connection_id]
        logger.info("[WS] disconnected %s", connection_id)

    def subscribe(self, connection_id: str, channel: str) -> None:
        self.channels.setdefault(channel, set()).add(connection_id)
        logger.info("[WS] %s subscribed to %s", connection_id, channel)

    async def broadcast_all(self, message: dict) -> None:
        for conn_id, conn in list(self.connections.items()):
            try:
                await conn.ws.send_json(message)
            except WebSocketDisconnect:
                self.disconnect(conn_id)
            except Exception:
                logger.exception("[WS] failed to send to %s", conn_id)
                self.disconnect(conn_id)

    async def broadcast_channel(self, channel: str, message: dict) -> None:
        subscribers = self.channels.get(channel, set())

        for conn_id in list(subscribers):
            conn = self.connections.get(conn_id)
            if not conn:
                subscribers.discard(conn_id)
                continue

            try:
                await conn.ws.send_json(message)
            except WebSocketDisconnect:
                self.disconnect(conn_id)
            except Exception:
                logger.exception("[WS] failed to send to %s", conn_id)
                self.disconnect(conn_id)


# singleton instance
ws_manager = WSManager()
