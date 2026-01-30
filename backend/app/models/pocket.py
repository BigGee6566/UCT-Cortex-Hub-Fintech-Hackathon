from __future__ import annotations

import uuid

from sqlalchemy import ForeignKey, Numeric, String, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Pocket(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "pockets"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    balance: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False, default=0)
    currency: Mapped[str | None] = mapped_column(String(8), nullable=True)

    user = relationship("User", back_populates="pockets")


Index("ix_pockets_user_name", Pocket.user_id, Pocket.name, unique=True)
