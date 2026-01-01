from app.ws.manager import ws_manager
from app.ws.events import ws_event


async def emit(event_type: str, data: dict) -> None:
    """
    WS dispatch entry-point.
    Routes events based on payload.
    """
    message = ws_event(event_type, data)

    if "conversation_id" in data:
        await ws_manager.broadcast_channel(
            data["conversation_id"],
            message,
        )
    else:
        await ws_manager.broadcast_all(message)
