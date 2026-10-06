"""Registration, login, refresh-token rotation and logout."""

import uuid
from datetime import UTC, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.config import get_settings
from app.core.errors import ApiError, unauthorized
from app.core.security import (
    create_access_token,
    hash_password,
    hash_refresh_token,
    new_refresh_token,
    password_needs_rehash,
    spend_equal_time_on_unknown_user,
    verify_password,
)
from app.models import AuthSession, User
from app.schemas.auth import TokenPair
from app.services import audit
from app.services.demo_data import seed_new_user

INVALID_CREDENTIALS = "Incorrect email or password."
SESSION_EXPIRED = "Your session has expired. Please log in again."


def normalise_email(email: str) -> str:
    return email.strip().lower()


def issue_tokens(db: Session, user_id: uuid.UUID, family_id: uuid.UUID | None = None) -> tuple[TokenPair, AuthSession]:
    """Creates a refresh-token session (only its hash is stored) and a matching access token."""
    refresh_token = new_refresh_token()
    session = AuthSession(
        user_id=user_id,
        family_id=family_id or uuid.uuid4(),
        token_hash=hash_refresh_token(refresh_token),
        expires_at=datetime.now(UTC) + timedelta(days=get_settings().refresh_token_days),
    )
    db.add(session)
    db.flush()
    access_token, expires_in = create_access_token(user_id)
    return TokenPair(access_token=access_token, refresh_token=refresh_token, expires_in=expires_in), session


def register(db: Session, email: str, password: str) -> TokenPair:
    email = normalise_email(email)
    if db.scalar(select(User.id).where(User.email == email)) is not None:
        raise ApiError(409, "email_taken", "An account with this email already exists. Try logging in.")

    user = User(email=email, password_hash=hash_password(password))
    db.add(user)
    try:
        db.flush()  # assigns user.id; a concurrent sign-up with the same email fails here
    except IntegrityError:
        db.rollback()
        raise ApiError(409, "email_taken", "An account with this email already exists. Try logging in.") from None

    seed_new_user(db, user.id)
    audit.record(db, "user.registered", user_id=user.id, resource_type="user", resource_id=str(user.id))
    tokens, _ = issue_tokens(db, user.id)
    db.commit()
    return tokens


def login(db: Session, email: str, password: str) -> TokenPair:
    user = db.scalar(select(User).where(User.email == normalise_email(email), User.deleted_at.is_(None)))
    if user is None:
        spend_equal_time_on_unknown_user(password)
        raise unauthorized("invalid_credentials", INVALID_CREDENTIALS)
    if not verify_password(password, user.password_hash):
        raise unauthorized("invalid_credentials", INVALID_CREDENTIALS)

    if password_needs_rehash(user.password_hash):  # upgrade hashes when Argon2 parameters change
        user.password_hash = hash_password(password)
    audit.record(db, "user.login", user_id=user.id, resource_type="user", resource_id=str(user.id))
    tokens, _ = issue_tokens(db, user.id)
    db.commit()
    return tokens


def refresh(db: Session, refresh_token: str) -> TokenPair:
    """Rotates a refresh token. Reusing an already-rotated token ends the whole login (theft signal)."""
    now = datetime.now(UTC)
    session = db.scalar(
        select(AuthSession).where(AuthSession.token_hash == hash_refresh_token(refresh_token)).with_for_update()
    )
    if session is None:
        raise unauthorized("invalid_refresh_token", SESSION_EXPIRED)

    if session.revoked_at is not None:
        # Only a token that was rotated out (it has a replacement) signals theft. Tokens ended by
        # logout, a password change or an earlier alarm are simply expired.
        if session.replaced_by_id is not None:
            revoke_family(db, session.family_id, now)
            audit.record(
                db,
                "session.reuse_detected",
                user_id=session.user_id,
                resource_type="session",
                resource_id=str(session.family_id),
            )
            db.commit()
        raise unauthorized("invalid_refresh_token", SESSION_EXPIRED)

    if session.expires_at <= now:
        raise unauthorized("invalid_refresh_token", SESSION_EXPIRED)

    session.revoked_at = now
    tokens, replacement = issue_tokens(db, session.user_id, family_id=session.family_id)
    session.replaced_by_id = replacement.id
    db.commit()
    return tokens


def logout(db: Session, refresh_token: str) -> None:
    """Ends one login. Always succeeds, so it reveals nothing about whether the token was valid."""
    session = db.scalar(select(AuthSession).where(AuthSession.token_hash == hash_refresh_token(refresh_token)))
    if session is not None and session.revoked_at is None:
        revoke_family(db, session.family_id, datetime.now(UTC))
        db.commit()


def revoke_family(db: Session, family_id: uuid.UUID, now: datetime) -> None:
    db.execute(
        update(AuthSession)
        .where(AuthSession.family_id == family_id, AuthSession.revoked_at.is_(None))
        .values(revoked_at=now)
    )


def revoke_all_sessions(db: Session, user_id: uuid.UUID) -> None:
    db.execute(
        update(AuthSession)
        .where(AuthSession.user_id == user_id, AuthSession.revoked_at.is_(None))
        .values(revoked_at=datetime.now(UTC))
    )
