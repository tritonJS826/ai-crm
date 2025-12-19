from pydantic import BaseModel, ConfigDict
from datetime import datetime
from typing import Optional
from app.schemas.user import Plan


class PaymentOut(BaseModel):
    id: str
    paymentId: str
    amount: float
    currency: str
    status: str
    description: Optional[str] = None
    createdAt: datetime


class PaymentCreateResponse(BaseModel):
    confirmation_url: str
    payment: PaymentOut


class SubscriptionOut(BaseModel):
    id: str
    plan: Plan
    startedAt: datetime
    endsAt: datetime
    consultationsIncluded: int
    consultationsUsed: int
    createdAt: datetime

    model_config = ConfigDict(from_attributes=True)
