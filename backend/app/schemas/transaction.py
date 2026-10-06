import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, ConfigDict

from app.schemas.common import Money


class TransactionOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    amount: Money  # always positive; `type` gives the direction
    type: Literal["income", "expense"]
    category: str | None
    description: str | None
    merchant: str | None
    date: datetime
