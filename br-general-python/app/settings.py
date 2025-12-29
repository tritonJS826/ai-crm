"""
Application settings module.

Loads configuration from environment variables with validation.
"""

from typing import Literal, Optional

from pydantic import EmailStr, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
ENV_PATH = BASE_DIR / ".env"


class Settings(BaseSettings):
    """Application configuration loaded from environment variables."""

    # Server
    server_port: int = Field(default=8000, alias="SERVER_PORT")
    env_type: Literal["dev", "prod"] = Field(default="dev", alias="ENV_TYPE")
    webapp_domain: str = Field(default="localhost", alias="WEBAPP_DOMAIN")
    app_base_url: str = Field(default="http://localhost:8000", alias="APP_BASE_URL")

    # Database
    database_url: str = Field(..., alias="DATABASE_URL")
    postgres_user: str = Field(..., alias="POSTGRES_USER")
    postgres_password: str = Field(..., alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(..., alias="POSTGRES_DB")

    # Email (SMTP)
    smtp_host: str = Field(default="localhost", alias="SMTP_HOST")
    smtp_port: int = Field(default=1025, alias="SMTP_PORT")
    smtp_user: Optional[str] = Field(default=None, alias="SMTP_USER")
    smtp_password: Optional[str] = Field(default=None, alias="SMTP_PASSWORD")
    smtp_starttls: bool = Field(default=False, alias="SMTP_STARTTLS")
    smtp_ssl: bool = Field(default=False, alias="SMTP_SSL")
    smtp_sender_email: EmailStr = Field(
        default="no-reply@example.com", alias="SMTP_SENDER_EMAIL"
    )
    smtp_sender_name: str = Field(default="UnifiedChat", alias="SMTP_SENDER_NAME")

    # JWT Authentication
    jwt_secret_key: str = Field(..., alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(default="HS256", alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(
        default=120, alias="ACCESS_TOKEN_EXPIRE_MINUTES"
    )
    refresh_token_expire_minutes: int = Field(
        default=10080, alias="REFRESH_TOKEN_EXPIRE_MINUTES"
    )

    # Meta API (WhatsApp, Messenger, Instagram)
    meta_verify_token: Optional[str] = Field(default=None, alias="META_VERIFY_TOKEN")
    meta_app_id: Optional[str] = Field(default=None, alias="META_APP_ID")
    meta_app_secret: Optional[str] = Field(default=None, alias="META_APP_SECRET")
    whatsapp_phone_number_id: Optional[str] = Field(
        default=None, alias="WHATSAPP_PHONE_NUMBER_ID"
    )
    whatsapp_access_token: Optional[str] = Field(
        default=None, alias="WHATSAPP_ACCESS_TOKEN"
    )
    facebook_page_access_token: Optional[str] = Field(
        default=None, alias="FACEBOOK_PAGE_ACCESS_TOKEN"
    )
    instagram_page_access_token: Optional[str] = Field(
        default=None, alias="IG_PAGE_ACCESS_TOKEN"
    )

    # Stripe Payments
    stripe_secret_key: Optional[str] = Field(default=None, alias="STRIPE_SECRET_KEY")
    stripe_webhook_secret: Optional[str] = Field(
        default=None, alias="STRIPE_WEBHOOK_SECRET"
    )

    # OpenAI (TODO - placeholder for AI drafting)
    openai_api_key: Optional[str] = Field(default=None, alias="OPENAI_API_KEY")

    model_config = SettingsConfigDict(
        env_file=str(ENV_PATH),
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def base_url(self) -> str:
        """Return base URL for local or test usage."""
        return f"http://{self.webapp_domain}:{self.server_port}"

    @property
    def flag_reload(self) -> bool:
        """Return true if in development mode."""
        return self.env_type == "dev"

    @property
    def is_meta_configured(self) -> bool:
        """Check if Meta API is properly configured."""
        return all(
            [
                self.meta_verify_token,
                self.meta_app_secret,
                self.whatsapp_access_token or self.facebook_page_access_token,
            ]
        )

    @property
    def is_stripe_configured(self) -> bool:
        """Check if Stripe is properly configured."""
        return all([self.stripe_secret_key, self.stripe_webhook_secret])

    @field_validator("database_url")
    @classmethod
    def validate_database_url(cls, v: str) -> str:
        """Ensure DATABASE_URL is a valid PostgreSQL connection string."""
        if not v.startswith(("postgresql://", "postgres://")):
            raise ValueError(
                "DATABASE_URL must start with postgresql:// or postgres://"
            )
        return v

    @field_validator("smtp_ssl")
    @classmethod
    def validate_tls_ssl_exclusive(cls, v: bool, info) -> bool:
        """Ensure SSL and STARTTLS are not both enabled."""
        starttls = info.data.get("smtp_starttls", False)
        if v and starttls:
            raise ValueError("Only one of SMTP_SSL or SMTP_STARTTLS can be true.")
        return v


settings = Settings()
