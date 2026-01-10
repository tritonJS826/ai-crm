from enum import Enum

from pydantic import BaseModel, Field
from datetime import datetime
from typing import Optional


class PaymentStatus(str, Enum):
    PENDING = "PENDING"
    SUCCEEDED = "SUCCEEDED"
    FAILED = "FAILED"


class PaymentOut(BaseModel):
    id: str
    payment_id: str = Field(..., alias="paymentId")
    amount: float
    currency: str
    status: PaymentStatus
    description: Optional[str] = None
    created_at: datetime = Field(..., alias="createdAt")

    model_config = {"populate_by_name": True}


class PaymentCreateResponse(BaseModel):
    confirmation_url: str
    payment: PaymentOut
