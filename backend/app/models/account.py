from __future__ import annotations

import uuid
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, Numeric, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.base import TimestampMixin, UUIDMixin


class Account(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "accounts"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    consent_id: Mapped[uuid.UUID | None] = mapped_column(UUID(as_uuid=True), ForeignKey("open_banking_consents.id", ondelete="SET NULL"), nullable=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    provider_account_id: Mapped[str] = mapped_column(String(128), nullable=False)

    name: Mapped[str | None] = mapped_column(String(255), nullable=True)
    type: Mapped[str | None] = mapped_column(String(64), nullable=True)
    currency: Mapped[str | None] = mapped_column(String(8), nullable=True)
    institution_name: Mapped[str | None] = mapped_column(String(255), nullable=True)

    user = relationship("User", back_populates="accounts")
    balances = relationship("Balance", back_populates="account", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="account", cascade="all, delete-orphan")


Index("ix_accounts_user_provider_account", Account.user_id, Account.provider, Account.provider_account_id, unique=True)


class Balance(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "balances"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    balance_type: Mapped[str] = mapped_column(String(64), nullable=False)
    amount: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False)
    currency: Mapped[str | None] = mapped_column(String(8), nullable=True)
    as_of: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    account = relationship("Account", back_populates="balances")


Index("ix_balances_account_type_asof", Balance.account_id, Balance.balance_type, Balance.as_of, unique=True)


class Transaction(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "transactions"

    user_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    account_id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), ForeignKey("accounts.id", ondelete="CASCADE"), nullable=False, index=True)
    provider: Mapped[str] = mapped_column(String(64), nullable=False, index=True)
    provider_transaction_id: Mapped[str] = mapped_column(String(128), nullable=False)

    amount: Mapped[float] = mapped_column(Numeric(18, 4), nullable=False)
    currency: Mapped[str | None] = mapped_column(String(8), nullable=True)
    description: Mapped[str | None] = mapped_column(Text, nullable=True)
    merchant: Mapped[str | None] = mapped_column(String(255), nullable=True)
    category: Mapped[str | None] = mapped_column(String(128), nullable=True)
    status: Mapped[str | None] = mapped_column(String(64), nullable=True)

    booked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    value_date: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    account = relationship("Account", back_populates="transactions")


Index("ix_transactions_account_provider_id", Transaction.account_id, Transaction.provider, Transaction.provider_transaction_id, unique=True)
