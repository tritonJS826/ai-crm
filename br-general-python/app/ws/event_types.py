"""
WebSocket event types for real-time communication.
"""

from enum import Enum


class WSEventType(str, Enum):
    """Enumeration of WebSocket event types."""

    # System events
    HEALTH_PING = "health_ping"

    # Chat events
    NEW_MESSAGE = "new_message"
    CONVERSATION_UPDATED = "conversation_updated"

    # Order events
    ORDER_CREATED = "order_created"
