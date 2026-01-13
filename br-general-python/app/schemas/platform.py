from enum import Enum


class Platform(str, Enum):
    """Supported messaging platforms."""

    WHATSAPP = "WHATSAPP"
    MESSENGER = "MESSENGER"
    INSTAGRAM = "INSTAGRAM"
