import uuid

from fastapi import APIRouter
from sqlalchemy import select

from app.api.deps import DB, CurrentUser
from app.core.errors import ApiError
from app.models import Budget
from app.schemas.budget import BudgetOut, BudgetUpdate

router = APIRouter(prefix="/budgets", tags=["budgets"])


@router.get("", response_model=list[BudgetOut])
def list_budgets(user: CurrentUser, db: DB) -> list[Budget]:
    return list(db.scalars(select(Budget).where(Budget.user_id == user.id).order_by(Budget.category)))


@router.put("/{budget_id}", response_model=BudgetOut)
def update_budget(budget_id: uuid.UUID, body: BudgetUpdate, user: CurrentUser, db: DB) -> Budget:
    # Filtering by user_id means another user's budget looks exactly like a missing one.
    budget = db.scalar(select(Budget).where(Budget.id == budget_id, Budget.user_id == user.id))
    if budget is None:
        raise ApiError(404, "not_found", "We couldn't find that budget.")
    budget.limit_amount = body.limit_amount
    db.commit()
    db.refresh(budget)
    return budget
