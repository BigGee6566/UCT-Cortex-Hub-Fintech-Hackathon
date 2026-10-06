"""Application settings, read from environment variables (or a local, git-ignored .env file)."""

from functools import lru_cache
from typing import Annotated, Literal

from pydantic import Field, field_validator, model_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

# Placeholder secrets from .env.example must never reach production.
_PLACEHOLDER_MARKERS = ("change-me", "changeme", "example")


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

    app_env: Literal["development", "test", "production"] = "development"

    # SQLAlchemy URL, e.g. postgresql+psycopg://user:password@host:5432/momali
    database_url: str

    # HMAC key for signing access tokens. Generate with: python -c "import secrets; print(secrets.token_urlsafe(48))"
    jwt_secret: str = Field(min_length=32)
    access_token_minutes: int = Field(default=15, ge=1, le=60)
    refresh_token_days: int = Field(default=30, ge=1, le=90)

    # Comma-separated list of browser origins allowed to call the API.
    cors_origins: Annotated[list[str], NoDecode] = ["http://localhost:8081"]

    log_level: str = "INFO"

    @field_validator("cors_origins", mode="before")
    @classmethod
    def split_origins(cls, value: object) -> object:
        if isinstance(value, str):
            return [origin.strip() for origin in value.split(",") if origin.strip()]
        return value

    @model_validator(mode="after")
    def reject_placeholder_secret_in_production(self) -> "Settings":
        if self.app_env == "production" and any(m in self.jwt_secret.lower() for m in _PLACEHOLDER_MARKERS):
            raise ValueError("JWT_SECRET is still a placeholder; set a random secret for production.")
        return self


@lru_cache
def get_settings() -> Settings:
    return Settings()  # type: ignore[call-arg]  # values come from the environment
