"""
User-related Pydantic schemas for request/response validation.
"""

from enum import Enum
from typing import Optional

from pydantic import BaseModel, EmailStr, Field, field_validator, ConfigDict


class Role(str, Enum):
    """User roles for authorization."""

    ADMIN = "ADMIN"
    AGENT = "AGENT"


# -------------------------
# INPUT SCHEMAS
# -------------------------


class UserCreate(BaseModel):
    """Schema for user registration request."""

    email: EmailStr
    password: str = Field(..., min_length=8)
    name: str = Field(..., min_length=1, max_length=100)
    role: Role = Role.AGENT

    @field_validator("password")
    @classmethod
    def password_not_whitespace(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Password cannot be empty")
        return v


class UserLogin(BaseModel):
    """Schema for user login request."""

    email: EmailStr
    password: str


# -------------------------
# OUTPUT SCHEMAS
# -------------------------


class UserOut(BaseModel):
    """Schema for user data in responses."""

    id: str
    email: EmailStr
    name: str
    role: Role

    model_config = ConfigDict(from_attributes=True)


class Token(BaseModel):
    """Schema for JWT token pair."""

    access_token: str
    refresh_token: Optional[str] = None
    token_type: str = "bearer"


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh request."""

    access_token: str
    refresh_token: str


class UserWithTokens(BaseModel):
    """Schema for user data with authentication tokens."""

    user: UserOut
    tokens: Optional[Token] = None


class LogoutResponse(BaseModel):
    """Schema for logout response."""

    message: str
