"""
Order-related Pydantic schemas for request/response validation.
"""

from datetime import datetime
from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class OrderStatus(str, Enum):
    """Order status options."""

    PENDING = "PENDING"
    PAID = "PAID"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class OrderOut(BaseModel):
    """Schema for order data in responses."""

    id: str
    contact_id: str = Field(..., alias="contactId")
    product_id: str = Field(..., alias="productId")
    # conversation_id: Optional conversation where the order originated.
    conversation_id: Optional[str] = Field(default=None, alias="conversationId")
    amount_cents: int = Field(..., alias="amountCents")
    currency: str
    stripe_session_id: str = Field(..., alias="stripeSessionId")
    status: OrderStatus
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = {"from_attributes": True, "populate_by_name": True}


class OrderListResponse(BaseModel):
    """Schema for order list response."""

    items: list[OrderOut]
    total: int
