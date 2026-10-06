import uuid
from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.schemas.common import Money

MAX_BUDGET = Decimal("1000000")  # same limit as the mobile editor


class BudgetOut(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    category: str
    limit_amount: Money
    period: str
    created_at: datetime
    updated_at: datetime


class BudgetUpdate(BaseModel):
    # 0 means "no limit". At most 2 decimal places (cents).
    limit_amount: Decimal = Field(ge=0, le=MAX_BUDGET, decimal_places=2)
