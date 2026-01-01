import asyncio
from app.logging import logger
from app.ws.dispatcher import emit
from app.events.domain import subscribe


async def _publish_ws_event(event_type: str, payload: dict) -> None:
    try:
        await emit(event_type, payload)
    except Exception:
        logger.exception("Failed to deliver WS event: %s", event_type)


def _ws_handler(event_type: str, payload: dict) -> None:
    asyncio.create_task(_publish_ws_event(event_type, payload))


# register adapter at import time
subscribe(_ws_handler)
