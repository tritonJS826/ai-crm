from app.settings import settings
from app.ws.manager import ws_manager
from app.ws.events import ws_event


async def emit(event_type: str, data: dict) -> None:
    """
    WS dispatch entry-point.
    """
    message = ws_event(event_type, data)

    conversation_id = data.get("conversation_id")

    if conversation_id:
        scope = f"ws:conversation:{conversation_id}"
        await ws_manager.broadcast_scope(scope, message)
        return

    # fallback: global broadcast (MVP only)
    if settings.enable_ws_broadcast_endpoint:
        await ws_manager.broadcast_all(message)
