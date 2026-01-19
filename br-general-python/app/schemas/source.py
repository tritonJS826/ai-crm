from enum import Enum


class Source(str, Enum):
    """Supported message sources."""

    CUSTOMER = "CUSTOMER"
    AGENT = "AGENT"
    SYSTEM = "SYSTEM"
