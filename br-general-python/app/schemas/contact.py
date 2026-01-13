"""
Contact-related Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field

from app.schemas.platform import Platform


class ContactBase(BaseModel):
    """Base schema for contact data."""

    platform: Platform
    platform_user_id: str = Field(..., alias="platformUserId")
    phone: Optional[str] = None
    name: Optional[str] = None

    model_config = {"populate_by_name": True}


class ContactCreate(ContactBase):
    """Schema for creating a new contact."""

    pass


class ContactOut(ContactBase):
    """Schema for contact data in responses."""

    id: str
    opt_out: bool = Field(default=False, alias="optOut")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = {"from_attributes": True, "populate_by_name": True}


class ContactOptOutUpdate(BaseModel):
    """Schema for updating contact opt-out status."""

    opt_out: bool = Field(..., alias="optOut")

    model_config = {"populate_by_name": True}
