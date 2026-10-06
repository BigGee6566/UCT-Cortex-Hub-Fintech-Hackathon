from typing import Annotated

from fastapi import APIRouter, Query
from sqlalchemy import select

from app.api.deps import DB, CurrentUser
from app.models import Transaction
from app.schemas.transaction import TransactionOut
from app.services.consents import require_scope

router = APIRouter(prefix="/transactions", tags=["transactions"])


@router.get("", response_model=list[TransactionOut])
def list_transactions(
    user: CurrentUser,
    db: DB,
    limit: Annotated[int, Query(ge=1, le=500)] = 100,
    offset: Annotated[int, Query(ge=0)] = 0,
) -> list[Transaction]:
    """Newest first. Requires the transactions:read consent (403 consent_required otherwise)."""
    require_scope(db, user.id, "transactions:read")
    query = (
        select(Transaction)
        .where(Transaction.user_id == user.id)
        .order_by(Transaction.date.desc(), Transaction.id)
        .limit(limit)
        .offset(offset)
    )
    return list(db.scalars(query))
