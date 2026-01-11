from enum import Enum


class MessageDirection(str, Enum):
    """Direction of a message relative to the customer."""

    IN = "IN"
    OUT = "OUT"
