from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
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
    last_seen: datetime
    token_exp: int  # unix timestamp (seconds)


class WSManager:
    def __init__(self) -> None:
        # all active connections
        self.connections: Dict[str, WSConnection] = {}
        self._scopes_by_connection: Dict[str, Set[str]] = defaultdict(set)
        self._connections_by_scope: Dict[str, Set[str]] = defaultdict(set)

    def connect(self, websocket: WebSocket, user_id: str, token_exp: int) -> str:
        connection_id = str(uuid.uuid4())
        self.connections[connection_id] = WSConnection(
            id=connection_id,
            ws=websocket,
            connected_at=datetime.now(timezone.utc),
            user_id=user_id,
            last_seen=datetime.now(timezone.utc),
            token_exp=token_exp,
        )

        logger.info("[WS] connected %s", connection_id)
        return connection_id

    def disconnect(self, connection_id: str) -> None:
        if connection_id not in self.connections:
            return

        scopes = self._scopes_by_connection.pop(connection_id, set())
        for scope in scopes:
            self._connections_by_scope[scope].discard(connection_id)
            if not self._connections_by_scope[scope]:
                del self._connections_by_scope[scope]

        del self.connections[connection_id]
        logger.info("[WS] disconnected %s", connection_id)

    def subscribe(self, connection_id: str, scope: str) -> None:
        self._scopes_by_connection[connection_id].add(scope)
        self._connections_by_scope[scope].add(connection_id)
        logger.info("[WS] %s subscribed to %s", connection_id, scope)

    def unsubscribe(self, connection_id: str, scope: str) -> None:
        self._scopes_by_connection[connection_id].discard(scope)
        self._connections_by_scope[scope].discard(connection_id)

        if (
            scope in self._connections_by_scope
            and not self._connections_by_scope[scope]
        ):
            del self._connections_by_scope[scope]
            logger.info("[WS] %s unsubscribed to %s", connection_id, scope)

    async def broadcast_all(self, message: dict) -> None:
        logger.info("[WS] broadcasting to all: %s", message)
        for conn_id, conn in list(self.connections.items()):
            try:
                await conn.ws.send_json(message)
                logger.info("[WS] sent to %s", conn_id)
            except WebSocketDisconnect:
                self.disconnect(conn_id)
            except Exception:
                logger.exception("[WS] failed to send to %s", conn_id)
                self.disconnect(conn_id)

    async def broadcast_scope(self, scope: str, message: dict) -> None:
        connection_ids = self._connections_by_scope.get(scope, set())

        for conn_id in list(connection_ids):
            conn = self.connections.get(conn_id)
            if not conn:
                connection_ids.discard(conn_id)
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
