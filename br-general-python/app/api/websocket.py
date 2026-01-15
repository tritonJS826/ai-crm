from datetime import timedelta, datetime, timezone
from time import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.api.access_control import can_user_access_conversation
from app.api.auth import auth_service
from app.ws.manager import ws_manager

from app.ws.events import ws_event

from app.settings import settings

router = APIRouter()

IDLE_TIMEOUT = timedelta(seconds=settings.ws_idle_timeout_seconds)


def is_idle_expired(last_seen: datetime) -> bool:
    return datetime.now(timezone.utc) - last_seen > IDLE_TIMEOUT


def is_token_expired(token_exp: int) -> bool:
    return token_exp <= int(time())


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=1008)
        return

    payload = auth_service.decode_token(token)
    if not payload:
        await websocket.close(code=1008)
        return

    token_exp = payload.get("exp")
    if not token_exp:
        await websocket.close(code=1008)
        return

    user_id = payload.get("sub")
    if not user_id:
        await websocket.close(code=1008)
        return

    role = payload.get("role")

    await websocket.accept()

    connection_id = ws_manager.connect(
        websocket=websocket,
        user_id=str(user_id),
        token_exp=token_exp,
    )

    try:
        while True:
            try:
                data = await websocket.receive_json()
            except ValueError:
                await websocket.send_json(
                    ws_event(
                        "error",
                        {"code": "invalid_json"},
                    )
                )
                await websocket.close(code=1003)  # unsupported data
                ws_manager.disconnect(connection_id)
                break

            conn = ws_manager.connections.get(connection_id)
            if not conn:
                break

            # 0. JWT expiration check
            if is_token_expired(conn.token_exp):
                await websocket.send_json(
                    ws_event(
                        "error",
                        {"code": "token_expired"},
                    )
                )
                await websocket.close(code=1008)
                ws_manager.disconnect(connection_id)
                break

            # 1. Idle timeout check
            if is_idle_expired(conn.last_seen):
                await websocket.send_json(
                    ws_event(
                        "error",
                        {"code": "idle_timeout"},
                    )
                )
                await websocket.close(code=1001)
                ws_manager.disconnect(connection_id)
                break

            msg_type = data.get("type")

            # 2. Ping does NOT update last_seen
            if msg_type == "ping":
                continue

            # 3. Real activity updates last_seen
            conn.last_seen = datetime.now(timezone.utc)

            # 4. Handle subscribe
            if msg_type == "subscribe":
                scope = data["data"]["scope"]
                scope_id = data["data"]["id"]

                if scope != "conversation" or not scope_id:
                    await websocket.send_json(
                        ws_event(
                            "error",
                            {"code": "invalid_subscribe"},
                        )
                    )
                    continue

                # Per-connection ACL cache to avoid repeated DB lookups
                acl_cache = getattr(conn, "acl_cache", None)
                if acl_cache is None:
                    acl_cache = {}
                    setattr(conn, "acl_cache", acl_cache)
                cache_key = scope_id

                # admin bypass (case-insensitive, tolerant of missing/None role)
                if isinstance(role, str) and role.lower() == "admin":
                    allowed = True
                    acl_cache[cache_key] = True
                else:
                    if cache_key in acl_cache:
                        allowed = acl_cache[cache_key]
                    else:
                        allowed = await can_user_access_conversation(
                            user_id=str(user_id),
                            conversation_id=scope_id,
                        )
                        acl_cache[cache_key] = allowed

                if not allowed:
                    await websocket.send_json(
                        ws_event(
                            "error",
                            {"code": "forbidden"},
                        )
                    )
                    await websocket.close(code=1008)
                    ws_manager.disconnect(connection_id)
                    break

                full_scope = f"ws:conversation:{scope_id}"
                ws_manager.subscribe(connection_id, full_scope)

                await websocket.send_json(
                    ws_event(
                        "subscribed",
                        {"scope": scope, "id": scope_id},
                    )
                )

    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(connection_id)
