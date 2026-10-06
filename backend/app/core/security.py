"""Password hashing (Argon2id), access tokens (signed JWT) and refresh tokens (random, stored hashed)."""

import hashlib
import secrets
import uuid
from datetime import UTC, datetime, timedelta
from functools import lru_cache

import jwt
from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError, VerifyMismatchError

from app.core.config import get_settings

JWT_ALGORITHM = "HS256"

# Argon2id with the library's default parameters (RFC 9106 low-memory profile).
_hasher = PasswordHasher()


def hash_password(password: str) -> str:
    return _hasher.hash(password)


def verify_password(password: str, password_hash: str) -> bool:
    try:
        return _hasher.verify(password_hash, password)
    except (VerifyMismatchError, VerificationError, InvalidHashError):
        return False


def password_needs_rehash(password_hash: str) -> bool:
    return _hasher.check_needs_rehash(password_hash)


@lru_cache
def _dummy_hash() -> str:
    return _hasher.hash(secrets.token_urlsafe(16))


def spend_equal_time_on_unknown_user(password: str) -> None:
    """Run one hash check for unknown emails so response time does not reveal which emails exist."""
    verify_password(password, _dummy_hash())


def create_access_token(user_id: uuid.UUID, now: datetime | None = None) -> tuple[str, int]:
    """Returns (token, lifetime in seconds)."""
    settings = get_settings()
    issued = now or datetime.now(UTC)
    lifetime = timedelta(minutes=settings.access_token_minutes)
    payload = {
        "sub": str(user_id),
        "type": "access",
        "iat": issued,
        "exp": issued + lifetime,
        "jti": secrets.token_hex(8),
    }
    token = jwt.encode(payload, settings.jwt_secret, algorithm=JWT_ALGORITHM)
    return token, int(lifetime.total_seconds())


def decode_access_token(token: str) -> uuid.UUID | None:
    """Returns the user id for a valid, unexpired access token, otherwise None."""
    try:
        payload = jwt.decode(
            token,
            get_settings().jwt_secret,
            algorithms=[JWT_ALGORITHM],  # pinned: never accept "none" or another algorithm
            options={"require": ["exp", "iat", "sub"]},
        )
    except jwt.PyJWTError:
        return None

    if payload.get("type") != "access":
        return None
    try:
        return uuid.UUID(payload["sub"])
    except (ValueError, TypeError):
        return None


def new_refresh_token() -> str:
    return secrets.token_urlsafe(48)


def hash_refresh_token(token: str) -> str:
    # Refresh tokens are long random strings, so a fast hash is enough; only the hash is stored.
    return hashlib.sha256(token.encode()).hexdigest()
