import uuid
from datetime import datetime

from pydantic import BaseModel, ConfigDict, EmailStr, Field, model_validator

from app.schemas.auth import PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH
from app.schemas.budget import BudgetOut
from app.schemas.consent import ConsentOut
from app.schemas.transaction import TransactionOut


class UserOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    email: str
    created_at: datetime
    updated_at: datetime


class UserUpdate(BaseModel):
    """Change email and/or password. Both require the current password."""

    email: EmailStr | None = None
    password: str | None = Field(default=None, min_length=PASSWORD_MIN_LENGTH, max_length=PASSWORD_MAX_LENGTH)
    current_password: str = Field(min_length=1, max_length=PASSWORD_MAX_LENGTH)

    @model_validator(mode="after")
    def something_to_change(self) -> "UserUpdate":
        if self.email is None and self.password is None:
            raise ValueError("Provide a new email or a new password.")
        return self


class AuditEntryOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    action: str
    resource_type: str | None
    resource_id: str | None
    details: dict | None
    timestamp: datetime


class DataExport(BaseModel):
    """Everything Mo'Mali holds about the user (POPIA access request)."""

    exported_at: datetime
    profile: UserOut
    budgets: list[BudgetOut]
    transactions: list[TransactionOut]
    consents: list[ConsentOut]
    activity: list[AuditEntryOut]
