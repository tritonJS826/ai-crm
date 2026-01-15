from datetime import datetime, timezone
from typing import TypedDict, Any


class WSEvent(TypedDict):
    type: str
    timestamp: str
    data: dict[str, Any]


def ws_event(event_type: str, data: dict) -> WSEvent:
    return {
        "type": event_type,
        "timestamp": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }
