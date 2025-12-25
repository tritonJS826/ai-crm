from typing import Any


def normalize_whatsapp_payload(payload: dict[str, Any]) -> list[dict[str, Any]]:
    """
    Returns a list of normalized inbound messages.
    One webhook can contain multiple messages.
    """

    messages: list[dict[str, Any]] = []

    for entry in payload.get("entry", []):
        for change in entry.get("changes", []):
            value = change.get("value", {})

            for msg in value.get("messages", []):
                messages.append(
                    {
                        "platform": "whatsapp",
                        "from": msg.get("from"),
                        "message_id": msg.get("id"),
                        "timestamp": msg.get("timestamp"),
                        "type": msg.get("type"),
                        "text": msg.get("text", {}).get("body"),
                        "raw": msg,
                    }
                )

    return messages
