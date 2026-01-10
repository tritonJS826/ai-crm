from enum import Enum

from pydantic import BaseModel
from typing import Optional


class MessageDirection(str, Enum):
    """Direction of a message relative to the customer."""

    IN = "IN"
    OUT = "OUT"


class NormalizedMessage(BaseModel):
    platform: str = "whatsapp"

    # WhatsApp identifiers
    from_number: str
    wa_id: str

    # User info
    name: Optional[str] = None

    # Message info
    message_id: str
    timestamp: int
    type: str
    text: Optional[str] = None

    # Routing / infra
    phone_number_id: str
    direction: MessageDirection = MessageDirection.IN
