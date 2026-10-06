"""Consent management: grant, revoke, list, and the check that guards every data read."""

import uuid
from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.errors import ApiError
from app.models import Consent
from app.services import audit

SCOPE_LABELS = {
    "balances:read": "Balances",
    "transactions:read": "Transactions",
    "income:read": "Income / NSFAS patterns",
    "debit_orders:read": "Debit orders",
}


def list_consents(db: Session, user_id: uuid.UUID) -> list[Consent]:
    return list(db.scalars(select(Consent).where(Consent.user_id == user_id).order_by(Consent.granted_at.desc())))


def _active(db: Session, user_id: uuid.UUID, scope: str) -> Consent | None:
    return db.scalar(
        select(Consent).where(Consent.user_id == user_id, Consent.scope == scope, Consent.revoked_at.is_(None))
    )


def require_scope(db: Session, user_id: uuid.UUID, scope: str) -> None:
    """Server-side permission check. Call before reading any data the scope covers."""
    if _active(db, user_id, scope) is None:
        raise ApiError(403, "consent_required", f"Allow {SCOPE_LABELS[scope]} access to use this feature.")


def grant(db: Session, user_id: uuid.UUID, scope: str) -> tuple[Consent, bool]:
    """Returns (consent, created). Granting an already-active scope returns the existing grant."""
    existing = _active(db, user_id, scope)
    if existing is not None:
        return existing, False

    consent = Consent(user_id=user_id, scope=scope)
    db.add(consent)
    try:
        db.flush()  # assigns the id; fails here if a concurrent request granted the same scope first
    except IntegrityError:
        db.rollback()
        return _active(db, user_id, scope), False  # type: ignore[return-value]

    audit.record(
        db,
        "consent.granted",
        user_id=user_id,
        resource_type="consent",
        resource_id=str(consent.id),
        details={"scope": scope},
    )
    db.commit()
    return consent, True


def revoke(db: Session, user_id: uuid.UUID, consent_id: uuid.UUID) -> None:
    """Revokes a grant. Idempotent; a grant that belongs to someone else is reported as not found."""
    consent = db.scalar(select(Consent).where(Consent.id == consent_id, Consent.user_id == user_id))
    if consent is None:
        raise ApiError(404, "not_found", "We couldn't find that consent.")
    if consent.revoked_at is None:
        consent.revoked_at = datetime.now(UTC)
        audit.record(
            db,
            "consent.revoked",
            user_id=user_id,
            resource_type="consent",
            resource_id=str(consent.id),
            details={"scope": consent.scope},
        )
        db.commit()
