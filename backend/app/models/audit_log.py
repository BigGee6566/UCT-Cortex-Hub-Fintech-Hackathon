import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Text, func
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, uuid_pk


class AuditLog(Base):
    """Who did what, when (consent grants and revocations, exports, deletions). Never holds personal data."""

    __tablename__ = "audit_logs"
    __table_args__ = (Index("ix_audit_logs_user_id_timestamp", "user_id", "timestamp"),)

    id: Mapped[uuid.UUID] = uuid_pk()
    # SET NULL keeps the anonymous trail after an account is erased.
    user_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"))
    action: Mapped[str] = mapped_column(Text, nullable=False)  # e.g. "consent.granted", "data.exported"
    resource_type: Mapped[str | None] = mapped_column(Text)
    resource_id: Mapped[str | None] = mapped_column(Text)
    # "metadata" is reserved on SQLAlchemy models, so the attribute is `details`.
    details: Mapped[dict | None] = mapped_column("metadata", JSONB)
    timestamp: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, server_default=func.now())
