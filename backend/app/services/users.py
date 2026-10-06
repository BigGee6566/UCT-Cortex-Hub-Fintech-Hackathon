"""Profile changes and the POPIA data-subject rights: access (export) and erasure (delete)."""

from datetime import UTC, datetime

from sqlalchemy import delete, select
from sqlalchemy.orm import Session

from app.core.errors import ApiError
from app.core.security import hash_password, verify_password
from app.models import AuditLog, Budget, Consent, Transaction, User
from app.schemas.user import DataExport, UserUpdate
from app.services import audit
from app.services.auth import normalise_email, revoke_all_sessions


def update_profile(db: Session, user: User, changes: UserUpdate) -> User:
    if not verify_password(changes.current_password, user.password_hash):
        raise ApiError(403, "current_password_incorrect", "Your current password is incorrect.")

    changed: list[str] = []
    if changes.email is not None:
        email = normalise_email(changes.email)
        if email != user.email:
            if db.scalar(select(User.id).where(User.email == email)) is not None:
                raise ApiError(409, "email_taken", "That email is already used by another account.")
            user.email = email
            changed.append("email")

    if changes.password is not None:
        user.password_hash = hash_password(changes.password)
        revoke_all_sessions(db, user.id)  # a password change signs out every device
        changed.append("password")

    if changed:
        audit.record(
            db,
            "user.updated",
            user_id=user.id,
            resource_type="user",
            resource_id=str(user.id),
            details={"fields": changed},
        )
        db.commit()
        db.refresh(user)
    return user


def export_data(db: Session, user: User) -> DataExport:
    """Everything stored about the user, in one JSON document. Excludes the password hash and token hashes."""
    export = DataExport.model_validate(
        {
            "exported_at": datetime.now(UTC),
            "profile": user,
            "budgets": list(db.scalars(select(Budget).where(Budget.user_id == user.id).order_by(Budget.category))),
            "transactions": list(
                db.scalars(select(Transaction).where(Transaction.user_id == user.id).order_by(Transaction.date))
            ),
            "consents": list(
                db.scalars(select(Consent).where(Consent.user_id == user.id).order_by(Consent.granted_at))
            ),
            "activity": list(
                db.scalars(select(AuditLog).where(AuditLog.user_id == user.id).order_by(AuditLog.timestamp))
            ),
        },
        from_attributes=True,
    )
    audit.record(db, "data.exported", user_id=user.id, resource_type="user", resource_id=str(user.id))
    db.commit()
    return export


def delete_account(db: Session, user: User) -> None:
    """Erases the account. Budgets, transactions, consents and sessions are removed by ON DELETE CASCADE.

    The audit trail keeps anonymous entries (user_id becomes NULL) plus one record that the deletion
    happened, so the platform can show it honoured the request without keeping personal data.
    """
    audit.record(db, "account.deleted", user_id=None, resource_type="user", resource_id=str(user.id))
    db.execute(delete(User).where(User.id == user.id))
    db.commit()
