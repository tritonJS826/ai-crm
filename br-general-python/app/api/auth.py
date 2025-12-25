"""
API endpoints for authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from app.db import db
from app.schemas.user import (
    UserCreate,
    Token,
    RefreshTokenRequest,
    UserWithTokens,
    UserOut,
    LogoutResponse,
    Role,
)
from app.repositories.user_repository import user_repo
from app.services.auth_service import AuthService

router = APIRouter()

auth_service = AuthService()


@router.post("/register", response_model=UserWithTokens, summary="Register new user")
async def register(user_in: UserCreate):
    """Register a new user (agent or admin)."""
    # Check if user exists
    existing = await user_repo.get_by_email(db, user_in.email)
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    # Hash password
    hashed_pw = auth_service.get_password_hash(user_in.password)

    # Create user
    user = await user_repo.create_user(
        db,
        email=user_in.email,
        hashed_password=hashed_pw,
        name=user_in.name,
        role=user_in.role,
    )

    # Create tokens
    access_token = auth_service.create_access_token({"sub": str(user.id)})
    refresh_token = auth_service.create_refresh_token({"sub": str(user.id)})

    user_out = UserOut(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=Role(user.role),
    )

    return UserWithTokens(
        user=user_out,
        tokens=Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        ),
    )


@router.post("/login", response_model=UserWithTokens)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """Login with email and password."""
    # Check if user exists
    user = await user_repo.get_by_email(db, form_data.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Verify password
    if not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # Create tokens
    access_token = auth_service.create_access_token({"sub": str(user.id)})
    refresh_token = auth_service.create_refresh_token({"sub": str(user.id)})

    user_out = UserOut(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=Role(user.role),
    )

    return UserWithTokens(
        user=user_out,
        tokens=Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        ),
    )


@router.post("/refresh", response_model=UserWithTokens)
async def refresh_tokens(body: RefreshTokenRequest):
    """Refresh access token using refresh token."""
    access_payload = auth_service.decode_token(body.access_token)
    refresh_payload = auth_service.decode_token(body.refresh_token)

    if not refresh_payload or refresh_payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    # Check sub match
    if access_payload and access_payload.get("sub") != refresh_payload.get("sub"):
        raise HTTPException(status_code=401, detail="Token pair mismatch")

    user_id = refresh_payload.get("sub")
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    new_access = auth_service.create_access_token({"sub": user_id})
    new_refresh = auth_service.create_refresh_token({"sub": user_id})

    user = await db.user.find_unique(where={"id": str(user_id)})
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    user_out = UserOut(
        id=str(user.id),
        email=user.email,
        name=user.name,
        role=Role(user.role),
    )

    return UserWithTokens(
        user=user_out,
        tokens=Token(
            access_token=new_access,
            refresh_token=new_refresh,
            token_type="bearer",
        ),
    )


@router.post(
    "/logout",
    response_model=LogoutResponse,
    status_code=status.HTTP_200_OK,
    summary="Logout user",
)
async def logout():
    """
    Stateless logout.

    The server does not revoke tokens.
    The client must discard tokens locally.
    """
    return LogoutResponse(
        message="Successfully logged out. Please discard your tokens on the client."
    )
