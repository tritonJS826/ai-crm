from datetime import datetime, timezone


def ws_event(event_type: str, data: dict) -> dict:
    return {
        "v": 1,
        "type": event_type,
        "ts": datetime.now(timezone.utc).isoformat(),
        "data": data,
    }
