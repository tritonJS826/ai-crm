from datetime import datetime


def ws_event(event_type: str, data: dict) -> dict:
    return {
        "v": 1,
        "type": event_type,
        "ts": datetime.utcnow().isoformat(),
        "data": data,
    }
