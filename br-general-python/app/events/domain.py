from typing import Any, Callable, List, Tuple
from app.logging import logger

# type: (event_type, payload)
Event = Tuple[str, dict[str, Any]]

# In-memory sink (used for tests)
_event_sink: List[Event] = []

# Optional subscribers (adapters attach here)
_subscribers: List[Callable[[str, dict[str, Any]], None]] = []


def subscribe(handler: Callable[[str, dict[str, Any]], None]) -> None:
    _subscribers.append(handler)


def clear_event_sink() -> None:
    _event_sink.clear()


def get_published_events() -> List[Event]:
    return list(_event_sink)


async def publish_event(event_type: str, payload: dict[str, Any]) -> None:
    """
    Pure domain event publisher.
    No transport, no async side effects.
    """
    logger.info("Domain event published: %s", event_type)

    # record fact (testable)
    _event_sink.append((event_type, payload))

    # notify subscribers (adapters)
    for handler in _subscribers:
        handler(event_type, payload)
