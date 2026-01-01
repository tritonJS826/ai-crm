import uuid
from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt, ExpiredSignatureError
from passlib.context import CryptContext

from app.settings import settings
from typing import Optional, Union

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


class AuthService:
    """Handles authentication logic: password hashing, JWT creation and decoding."""

    def get_password_hash(self, password: str) -> str:
        """Hash plain password using Argon2."""
        return pwd_context.hash(password)

    def verify_password(self, plain_password: str, hashed_password: str) -> bool:
        """Verify a plain password against its hashed value."""
        return pwd_context.verify(plain_password, hashed_password)

    def create_access_token(self, data: dict) -> str:
        """Create a short-lived access JWT."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.access_token_expire_minutes
        )
        to_encode.update(
            {
                "exp": expire,
                "iat": datetime.now(timezone.utc),
                "jti": str(uuid.uuid4()),
                "type": "access",
            }
        )
        return jwt.encode(
            to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )

    def create_refresh_token(self, data: dict) -> str:
        """Create a long-lived refresh JWT."""
        to_encode = data.copy()
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=settings.refresh_token_expire_minutes
        )
        to_encode.update(
            {
                "exp": expire,
                "iat": datetime.now(timezone.utc),
                "jti": str(uuid.uuid4()),
                "type": "refresh",
            }
        )
        return jwt.encode(
            to_encode, settings.jwt_secret_key, algorithm=settings.jwt_algorithm
        )

    def decode_token(self, token: str) -> Optional[dict]:
        if token.startswith("Bearer "):
            token = token.removeprefix("Bearer ").strip()

        try:
            return jwt.decode(
                token,
                settings.jwt_secret_key,
                algorithms=[settings.jwt_algorithm],
            )
        except JWTError:
            return None

    def decode_token_with_exp(self, token: str) -> Union[dict, str, None]:
        """Decode token but return 'expired' if expired, None if invalid."""
        try:
            return jwt.decode(
                token, settings.jwt_secret_key, algorithms=[settings.jwt_algorithm]
            )
        except ExpiredSignatureError:
            return "expired"
        except JWTError:
            return None
