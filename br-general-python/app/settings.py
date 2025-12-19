from typing import Literal, Optional
from pydantic_settings import BaseSettings, SettingsConfigDict
from pydantic import Field, field_validator, EmailStr

import os

BASE_DIR = os.path.dirname(os.path.dirname(__file__))  # br-general-python/
ENV_PATH = os.path.join(BASE_DIR, ".env")


class Settings(BaseSettings):
    server_port: int = Field(..., alias="SERVER_PORT")
    env_type: Literal["dev", "prod"] = Field(default="dev", alias="ENV_TYPE")
    webapp_domain: str = Field(..., alias="WEBAPP_DOMAIN")

    database_url: str = Field(..., alias="DATABASE_URL")
    postgres_user: str = Field(..., alias="POSTGRES_USER")
    postgres_password: str = Field(..., alias="POSTGRES_PASSWORD")
    postgres_db: str = Field(..., alias="POSTGRES_DB")

    # --- email config ---
    smtp_host: str = Field(..., alias="SMTP_HOST")
    smtp_port: int = Field(..., alias="SMTP_PORT")
    smtp_user: Optional[str] = Field(..., alias="SMTP_USER")
    smtp_password: Optional[str] = Field(..., alias="SMTP_PASSWORD")
    smtp_starttls: bool = Field(..., alias="SMTP_STARTTLS")
    smtp_ssl: bool = Field(..., alias="SMTP_SSL")
    smtp_sender_email: EmailStr = Field(..., alias="SMTP_SENDER_EMAIL")
    smtp_sender_name: str = Field(..., alias="SMTP_SENDER_NAME")

    # user auth / jwt
    jwt_secret_key: str = Field(..., alias="JWT_SECRET_KEY")
    jwt_algorithm: str = Field(..., alias="JWT_ALGORITHM")
    access_token_expire_minutes: int = Field(..., alias="ACCESS_TOKEN_EXPIRE_MINUTES")
    refresh_token_expire_minutes: int = Field(..., alias="REFRESH_TOKEN_EXPIRE_MINUTES")

    # payments settings
    yookassa_shop_id: str = Field(..., alias="YOOKASSA_SHOP_ID")
    yookassa_secret: str = Field(..., alias="YOOKASSA_SECRET")
    frontend_url: str = Field(..., alias="FRONTEND_URL")

    model_config = SettingsConfigDict(
        env_file=ENV_PATH,
        env_file_encoding="utf-8",
        case_sensitive=True,
    )

    @property
    def base_url(self) -> str:
        """Return base URL for local or test usage."""
        return f"http://{self.webapp_domain}:{self.server_port}"

    @property
    def flag_reload(self) -> bool:
        """Return true if in development mode, else false."""
        return self.env_type == "dev"

    @field_validator("database_url")
    @classmethod
    def _db_url_must_be_pg(cls, v: str) -> str:
        if not v.startswith(("postgresql://", "postgres://")):
            raise ValueError(
                "DATABASE_URL must start with postgresql:// or postgres://"
            )
        return v

    @field_validator("smtp_ssl")
    @classmethod
    def _validate_tls_ssl(cls, v: bool, info):
        # avoid SSL and STARTTLS both true
        starttls = info.data.get("smtp_starttls", False)
        if v and starttls:
            raise ValueError("Only one of SMTP_SSL or SMTP_STARTTLS can be true.")
        return v


settings = Settings()
