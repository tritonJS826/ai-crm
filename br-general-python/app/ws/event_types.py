from enum import Enum


class WSEventType(str, Enum):
    HEALTH_PING = "health_ping"
