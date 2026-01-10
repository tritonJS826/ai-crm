from datetime import datetime, timezone
from typing import TypedDict, Any


class WSEvent(TypedDict):
    v: int
    type: str
    ts: str
    data: dict[str, Any]


def ws_event(event_type: str, data: dict) -> WSEvent:
    return {
        "v": 1,
        "type": event_type,
        "ts": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }
