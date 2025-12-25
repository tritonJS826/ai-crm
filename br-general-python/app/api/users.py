"""
API endpoints for user profile management.
"""

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr

from app.db import db
from app.api.auth import get_current_user
from app.repositories.user_repository import user_repo
from app.schemas.user import UserOut

router = APIRouter()


class UserProfileUpdate(BaseModel):
    """User profile update request."""

    name: Optional[str] = None
    email: Optional[EmailStr] = None


@router.get("/me", response_model=UserOut)
async def get_current_user_profile(
    current_user: dict = Depends(get_current_user),
) -> UserOut:
    """Get current user profile."""
    user = await user_repo.get_by_id(db, current_user["user_id"])

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        role=user.role,
        createdAt=user.createdAt,
    )


@router.patch("/me", response_model=UserOut)
async def update_current_user_profile(
    payload: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
) -> UserOut:
    """Update current user profile."""
    user = await user_repo.get_by_id(db, current_user["user_id"])

    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    update_data = {}
    if payload.name is not None:
        update_data["name"] = payload.name
    if payload.email is not None:
        existing = await user_repo.get_by_email(db, payload.email)
        if existing and existing.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already in use",
            )
        update_data["email"] = payload.email

    if not update_data:
        return UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            role=user.role,
            createdAt=user.createdAt,
        )

    updated_user = await db.user.update(
        where={"id": user.id},
        data=update_data,
    )

    return UserOut(
        id=updated_user.id,
        email=updated_user.email,
        name=updated_user.name,
        role=updated_user.role,
        createdAt=updated_user.createdAt,
    )
