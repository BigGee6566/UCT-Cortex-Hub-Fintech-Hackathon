from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import DB, CurrentUser
from app.models import Budget, Transaction
from app.schemas.insights import CoachCard, HealthScoreOut, InsightsOut, SafeToSpendOut
from app.services import insights
from app.services.consents import require_scope

router = APIRouter(prefix="/insights", tags=["insights"])


@router.get("", response_model=InsightsOut)
def get_insights(user: CurrentUser, db: DB) -> InsightsOut:
    """Health score and coach cards from your transactions. Requires transactions:read."""
    require_scope(db, user.id, "transactions:read")

    txs = list(db.scalars(select(Transaction).where(Transaction.user_id == user.id)))
    budgets = {
        b.category: b.limit_amount
        for b in db.scalars(select(Budget).where(Budget.user_id == user.id, Budget.period == "monthly"))
    }
    score = insights.compute_health_score(txs, budgets)

    return InsightsOut(
        label=insights.LABEL,
        health_score=HealthScoreOut(
            score=score.score, savings_rate=score.savings_rate, budget_utilisation=score.budget_utilisation
        ),
        cards=[CoachCard(**card) for card in insights.coach_cards(txs, budgets)],
        # The formula is implemented (services/insights.py) but needs data the app doesn't collect yet.
        safe_to_spend=SafeToSpendOut(
            available=False,
            reason=(
                "Needs your account balance and next income date, which arrive with income events and bank connection."
            ),
        ),
    )
