from app.ws.manager import ws_manager
from app.ws.events import ws_event


async def emit(event_type: str, data: dict) -> None:
    """
    Single entry-point for server -> client WS events.
    Keeps WS concerns out of business endpoints/services.
    """
    await ws_manager.broadcast(ws_event(event_type, data))
