"""
API endpoints for authentication.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer

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
from app.services.auth_service import auth_service

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/br-general/auth/login")

router = APIRouter()


# -------------------------
# Dependencies
# -------------------------


async def get_current_user(token: str = Depends(oauth2_scheme)) -> UserOut:
    """Get currently authenticated user (access token required)."""
    try:
        payload = auth_service.require_access_token(token)
        user_id = payload.get("sub")
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

    user = await user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserOut(
        id=user.id,
        email=user.email,
        name=user.name,
        role=Role(user.role),
    )


# -------------------------
# Routes
# -------------------------


@router.post("/register", response_model=UserWithTokens)
async def register(user_in: UserCreate):
    """Register a new user."""
    if await user_repo.get_by_email(db, user_in.email):
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_pw = auth_service.hash_password(user_in.password)

    user = await user_repo.create(
        db,
        email=user_in.email,
        hashed_password=hashed_pw,
        name=user_in.name,
        role=user_in.role,
    )

    access_token = auth_service.create_access_token(user.id)
    refresh_token = auth_service.create_refresh_token(user.id)

    return UserWithTokens(
        user=UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            role=Role(user.role),
        ),
        tokens=Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        ),
    )


@router.post("/login", response_model=UserWithTokens)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = await user_repo.get_by_email(db, form_data.username)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not auth_service.verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    access_token = auth_service.create_access_token(user.id)
    refresh_token = auth_service.create_refresh_token(user.id)

    return UserWithTokens(
        user=UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            role=Role(user.role),
        ),
        tokens=Token(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
        ),
    )


@router.post("/refresh", response_model=UserWithTokens)
async def refresh_tokens(body: RefreshTokenRequest):
    try:
        refresh_payload = auth_service.require_refresh_token(body.refresh_token)
        user_id = refresh_payload.get("sub")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = await user_repo.get_by_id(db, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return UserWithTokens(
        user=UserOut(
            id=user.id,
            email=user.email,
            name=user.name,
            role=Role(user.role),
        ),
        tokens=Token(
            access_token=auth_service.create_access_token(user.id),
            refresh_token=auth_service.create_refresh_token(user.id),
            token_type="bearer",
        ),
    )


@router.post("/logout", response_model=LogoutResponse)
async def logout():
    """Stateless logout. Client discards tokens."""
    return LogoutResponse(
        message="Successfully logged out. Please discard your tokens on the client."
    )
