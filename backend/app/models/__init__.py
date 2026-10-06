"""Importing this package registers every table on Base.metadata (needed by Alembic)."""

from app.models.audit_log import AuditLog
from app.models.base import Base
from app.models.budget import Budget
from app.models.consent import SCOPES, Consent
from app.models.session import AuthSession
from app.models.transaction import Transaction
from app.models.user import User

__all__ = ["SCOPES", "AuditLog", "AuthSession", "Base", "Budget", "Consent", "Transaction", "User"]
