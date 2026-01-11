"""
Webhook-related Pydantic schemas for Meta and Stripe webhooks.
"""

from enum import Enum
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field

from app.schemas.platform import Platform


# ============================================
# META WEBHOOK SCHEMAS
# ============================================


class MetaMessageType(str, Enum):
    TEXT = "text"
    IMAGE = "image"


class StripePaymentStatus(str, Enum):
    PAID = "paid"
    UNPAID = "unpaid"
    NO_PAYMENT_REQUIRED = "no_payment_required"


class MetaWebhookVerify(BaseModel):
    """Schema for Meta webhook verification challenge."""

    mode: str = Field(..., alias="hub.mode")
    token: str = Field(..., alias="hub.verify_token")
    challenge: str = Field(..., alias="hub.challenge")

    model_config = {"populate_by_name": True}


class MetaMessageText(BaseModel):
    """Schema for text message content."""

    body: str


class MetaMessage(BaseModel):
    """Schema for individual message in webhook."""

    id: str
    from_: str = Field(..., alias="from")
    timestamp: str
    type: MetaMessageType
    text: Optional[MetaMessageText] = None

    model_config = {"populate_by_name": True}


class MetaContact(BaseModel):
    """Schema for contact info in webhook."""

    wa_id: str
    profile: Optional[Dict[str, Any]] = None


class MetaWebhookValue(BaseModel):
    """Schema for webhook value payload."""

    messaging_product: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    contacts: Optional[List[MetaContact]] = None
    messages: Optional[List[MetaMessage]] = None


class MetaWebhookChange(BaseModel):
    """Schema for webhook change entry."""

    field: str
    value: MetaWebhookValue


class MetaWebhookEntry(BaseModel):
    """Schema for webhook entry."""

    id: str
    changes: List[MetaWebhookChange]


class MetaWebhookPayload(BaseModel):
    """Schema for complete Meta webhook payload."""

    object: str
    entry: List[MetaWebhookEntry]


# ============================================
# NORMALIZED MESSAGE (internal use)
# ============================================


class NormalizedMessage(BaseModel):
    """Normalized message format for internal processing."""

    platform: Platform
    platform_user_id: str
    text: Optional[str] = None
    media_url: Optional[str] = None
    remote_message_id: str
    contact_name: Optional[str] = None
    contact_phone: Optional[str] = None


# ============================================
# STRIPE WEBHOOK SCHEMAS
# ============================================


class StripeWebhookPayload(BaseModel):
    """Schema for Stripe webhook payload."""

    id: str
    type: str
    data: Dict[str, Any]


class StripeCheckoutSession(BaseModel):
    """Schema for Stripe checkout.session.completed event."""

    id: str
    client_reference_id: Optional[str] = None
    metadata: Optional[Dict[str, str]] = None
    amount_total: Optional[int] = None
    currency: Optional[str] = None
    payment_status: StripePaymentStatus
