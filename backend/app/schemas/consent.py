import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict, computed_field

Scope = Literal["balances:read", "transactions:read", "income:read", "debit_orders:read"]


class ConsentCreate(BaseModel):
    scope: Scope


class ConsentOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    scope: Scope
    granted_at: datetime
    revoked_at: datetime | None

    @computed_field
    @property
    def active(self) -> bool:
        return self.revoked_at is None
