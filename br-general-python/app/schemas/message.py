from pydantic import BaseModel
from typing import Optional

from app.schemas.platform import Platform
from app.schemas.source import Source


class NormalizedMessage(BaseModel):
    platform: Platform

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

    source: Source
