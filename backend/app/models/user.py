import uuid
from datetime import datetime

from sqlalchemy import DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.models.base import Base, created_at, updated_at, uuid_pk


class User(Base):
    __tablename__ = "users"

    id: Mapped[uuid.UUID] = uuid_pk()
    email: Mapped[str] = mapped_column(Text, unique=True, nullable=False)  # stored lower-case
    password_hash: Mapped[str] = mapped_column(Text, nullable=False)  # Argon2id; the password itself is never stored
    created_at: Mapped[datetime] = created_at()
    updated_at: Mapped[datetime] = updated_at()
    # Reserved for a future grace-period deletion flow; DELETE /me currently erases the row immediately.
    deleted_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True))
