import uuid
from datetime import datetime

from sqlalchemy import CheckConstraint, DateTime, ForeignKey, Index, Text, func, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, uuid_pk

# Same scope ids as the mobile app (FRONTEND/MoMali/types/consent.ts).
SCOPES = ("balances:read", "transactions:read", "income:read", "debit_orders:read")


class Consent(Base):
    """One grant of one scope. Revoking sets revoked_at; rows are kept as the consent history."""

    __tablename__ = "consents"
    __table_args__ = (
        CheckConstraint(
            "scope IN ('balances:read', 'transactions:read', 'income:read', 'debit_orders:read')", name="scope_valid"
        ),
        # At most one active (unrevoked) grant per user and scope.
        Index(
            "uq_consents_one_active_per_scope",
            "user_id",
            "scope",
            unique=True,
            postgresql_where=text("revoked_at IS NULL"),
        ),
    )

    id: Mapped[uuid.UUID] = uuid_pk()
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    scope: Mapped[str] = mapped_column(Text, nullable=False)
    granted_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
    revoked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
