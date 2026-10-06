"""Audit trail for POPIA-relevant actions. Entries must never contain personal information."""

import uuid

from sqlalchemy.orm import Session

from app.models import AuditLog

# Only these detail keys are allowed: they describe *what* changed, never the values.
ALLOWED_DETAIL_KEYS = frozenset({"scope", "fields"})


def record(
    db: Session,
    action: str,
    *,
    user_id: uuid.UUID | None,
    resource_type: str | None = None,
    resource_id: str | None = None,
    details: dict | None = None,
) -> None:
    """Adds an audit entry to the current transaction (committed by the caller)."""
    if details and not set(details) <= ALLOWED_DETAIL_KEYS:
        raise ValueError(f"Audit details may only use {sorted(ALLOWED_DETAIL_KEYS)}")
    db.add(
        AuditLog(user_id=user_id, action=action, resource_type=resource_type, resource_id=resource_id, details=details)
    )
