from datetime import datetime, timedelta, timezone

from jose import JWTError, jwt
from passlib.context import CryptContext
from uuid import uuid4

from ..settings import settings


class InvalidTokenError(Exception):
    """Token is invalid or malformed."""


class ExpiredTokenError(Exception):
    """Token has expired."""


class WrongTokenTypeError(Exception):
    """Token type is not allowed for this operation."""


pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class AuthService:
    """Authentication and token service."""

    # -------------------------
    # Password hashing
    # -------------------------

    def hash_password(self, password: str) -> str:
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        return pwd_context.verify(plain_password, hashed_password)

    # -------------------------
    # Token creation
    # -------------------------

    def _create_token(
        self,
        subject: str,
        token_type: str,
        expires_delta: timedelta,
    ) -> str:
        now = datetime.now(timezone.utc)

        payload = {
            "sub": subject,
            "type": token_type,  # "access" or "refresh"
            "iat": now,
            "exp": now + expires_delta,
            "jti": str(uuid4()),
        }

        return jwt.encode(
            payload,
            settings.jwt_secret_key,
            algorithm=settings.jwt_algorithm,
        )

    def create_access_token(self, user_id: str) -> str:
        return self._create_token(
            subject=user_id,
            token_type="access",
            expires_delta=timedelta(minutes=settings.access_token_expire_minutes),
        )

    def create_refresh_token(self, user_id: str) -> str:
        return self._create_token(
            subject=user_id,
            token_type="refresh",
            expires_delta=timedelta(minutes=settings.refresh_token_expire_minutes),
        )

    # -------------------------
    # Token decoding
    # -------------------------

    def decode_token(self, token: str) -> dict:
        """
        Decode a JWT and return payload.

        Raises:
            InvalidTokenError
            ExpiredTokenError
        """
        if token.startswith("Bearer "):
            token = token.removeprefix("Bearer ").strip()

        try:
            payload = jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
            return payload

        except jwt.ExpiredSignatureError:
            raise ExpiredTokenError("Token has expired")

        except JWTError:
            raise InvalidTokenError("Invalid token")

    # -------------------------
    # Token type enforcement
    # -------------------------

    def require_access_token(self, token: str) -> dict:
        payload = self.decode_token(token)

        if payload.get("type") != "access":
            raise WrongTokenTypeError("Access token required")

        return payload

    def require_refresh_token(self, token: str) -> dict:
        payload = self.decode_token(token)

        if payload.get("type") != "refresh":
            raise WrongTokenTypeError("Refresh token required")

        return payload


auth_service = AuthService()
