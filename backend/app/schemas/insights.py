from pydantic import BaseModel

from app.schemas.common import Money


class HealthScoreOut(BaseModel):
    score: int  # 0-100
    savings_rate: float  # 0-1
    budget_utilisation: float  # 0-1 (1 = on or under every budget)


class CoachCard(BaseModel):
    id: str
    title: str
    message: str


class SafeToSpendOut(BaseModel):
    available: bool
    amount_per_day: Money | None = None
    reason: str | None = None  # why it can't be calculated yet


class InsightsOut(BaseModel):
    label: str  # shown to users so demo guidance is never mistaken for advice
    health_score: HealthScoreOut
    cards: list[CoachCard]
    safe_to_spend: SafeToSpendOut
