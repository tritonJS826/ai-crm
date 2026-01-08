"""
Product-related Pydantic schemas for request/response validation.
"""

from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator


class ProductBase(BaseModel):
    """Base schema for product data."""

    title: str = Field(..., min_length=1, max_length=200)
    price_cents: int = Field(..., alias="priceCents", gt=0)
    currency: str = Field(default="USD", max_length=3)
    image_url: Optional[str] = Field(default=None, alias="imageUrl")
    description: Optional[str] = None
    stripe_price_id: str = Field(..., alias="stripePriceId")

    model_config = {"populate_by_name": True}

    @field_validator("currency")
    @classmethod
    def validate_currency(cls, v: str) -> str:
        """Ensure currency is uppercase."""
        return v.upper()

    @field_validator("stripe_price_id")
    @classmethod
    def stripe_price_id_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("stripePriceId cannot be empty")
        return v


class ProductCreate(ProductBase):
    """Schema for creating a new product."""

    pass


class ProductUpdate(BaseModel):
    """Schema for updating a product."""

    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    price_cents: Optional[int] = Field(default=None, alias="priceCents", gt=0)
    currency: Optional[str] = Field(default=None, max_length=3)
    image_url: Optional[str] = Field(default=None, alias="imageUrl")
    description: Optional[str] = None
    stripe_price_id: Optional[str] = Field(default=None, alias="stripePriceId")
    is_active: Optional[bool] = Field(default=None, alias="isActive")

    model_config = {"populate_by_name": True}


class ProductOut(ProductBase):
    """Schema for product data in responses."""

    id: str
    is_active: bool = Field(default=True, alias="isActive")
    created_at: datetime = Field(..., alias="createdAt")
    updated_at: datetime = Field(..., alias="updatedAt")

    model_config = {"from_attributes": True, "populate_by_name": True}


class ProductListResponse(BaseModel):
    """Schema for product list response."""

    items: list[ProductOut]
    total: int
