from __future__ import annotations

from functools import lru_cache
from typing import List, Optional

from pydantic import AnyUrl, Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables.

    We fail fast on missing critical configuration to avoid running in a
    partially configured state.
    """

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", case_sensitive=True)

    # Open Banking configuration (required)
    OB_BASE_URL: AnyUrl
    OB_CLIENT_ID: str
    OB_CLIENT_SECRET: str
    MTLS_HEADER_VALUE: str

    # Database configuration (required)
    DATABASE_URL: str

    # Optional runtime configuration
    CORS_ORIGINS: Optional[str] = Field(default=None, description="Comma-separated list of allowed origins")

    # Email provider configuration
    EMAIL_PROVIDER: Optional[str] = Field(default="sendgrid")
    EMAIL_FROM: Optional[str] = None
    SENDGRID_API_KEY: Optional[str] = None

    # OTP configuration
    OTP_EXPIRY_MINUTES: int = 10
    OTP_MAX_ATTEMPTS: int = 3
    OTP_RESEND_MIN_SECONDS: int = 60
    OTP_MAX_PER_HOUR: int = 5

    # Provider-specific optional overrides
    OB_TOKEN_PATH: str = Field(default="/connect/mtls/token")
    OB_CONSENTS_PATH: str = Field(default="/account-access-consents")
    OB_ACCOUNTS_PATH: str = Field(default="/accounts")
    OB_PSU_AUTHORIZE_PATH: str = Field(default="/psu/authorize/ui")
    OB_TOKEN_SCOPE: Optional[str] = Field(default=None, description="Optional OAuth scope string for token endpoint")
    OB_CONSENT_EXPIRY_DAYS: int = Field(default=90, description="Consent expiry window in days")

    # Token refresh safety window (seconds)
    TOKEN_REFRESH_SAFETY_WINDOW: int = 120


@lru_cache
def get_settings() -> Settings:
    settings = Settings()

    # Fail fast on any missing required variables (BaseSettings already enforces this)
    # but we enforce empty strings as well.
    missing = []
    for key in ("OB_BASE_URL", "OB_CLIENT_ID", "OB_CLIENT_SECRET", "MTLS_HEADER_VALUE", "DATABASE_URL"):
        value = getattr(settings, key, None)
        if value is None or (isinstance(value, str) and not value.strip()):
            missing.append(key)
    if missing:
        raise RuntimeError(f"Missing required environment variables: {', '.join(missing)}")

    return settings
