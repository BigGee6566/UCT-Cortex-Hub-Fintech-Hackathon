"""Demo budgets and transactions given to every new account until Open Finance data is connected.

Kept identical to the mobile app's mock data (FRONTEND/MoMali/services/mockFinance.ts), so the
health score is the same in both places (71/100 with the default budgets).
"""

from datetime import UTC, datetime
from decimal import Decimal

from sqlalchemy.orm import Session

from app.models import Budget, Transaction

CATEGORIES = ("Food", "Transport", "Data/Airtime", "Rent", "Education", "Health", "Entertainment", "Other")

DEFAULT_BUDGETS: dict[str, Decimal] = {
    "Food": Decimal("1200"),
    "Transport": Decimal("800"),
    "Data/Airtime": Decimal("500"),
    "Rent": Decimal("2500"),
    "Education": Decimal("700"),
    "Health": Decimal("300"),
    "Entertainment": Decimal("400"),
    "Other": Decimal("300"),
}

# (date, description, category, type, amount, merchant)
DEMO_TRANSACTIONS: tuple[tuple[str, str, str, str, str, str | None], ...] = (
    ("2026-01-02", "NSFAS Allowance", "Other", "income", "2800", None),
    ("2026-01-03", "Taxi to Campus", "Transport", "expense", "28", "Taxi"),
    ("2026-01-03", "Groceries", "Food", "expense", "240", "Shoprite"),
    ("2026-01-05", "Data Bundle", "Data/Airtime", "expense", "120", "MTN"),
    ("2026-01-06", "Lunch", "Food", "expense", "55", "Cafeteria"),
    ("2026-01-08", "Airtime", "Data/Airtime", "expense", "30", "Vodacom"),
    ("2026-01-10", "Clinic", "Health", "expense", "80", "Clinic"),
    ("2026-01-12", "Movie", "Entertainment", "expense", "90", "Cinema"),
    ("2026-01-14", "Books/Printing", "Education", "expense", "160", "Campus Print"),
    ("2026-01-16", "Rent Contribution", "Rent", "expense", "1200", "Landlord"),
)


def seed_new_user(db: Session, user_id) -> None:
    """Adds default budgets and demo transactions for a new user (committed by the caller)."""
    db.add_all(Budget(user_id=user_id, category=c, limit_amount=amount) for c, amount in DEFAULT_BUDGETS.items())
    db.add_all(
        Transaction(
            user_id=user_id,
            date=datetime.fromisoformat(day).replace(tzinfo=UTC),
            description=description,
            category=category,
            type=kind,
            amount=Decimal(amount),
            merchant=merchant,
        )
        for day, description, category, kind, amount, merchant in DEMO_TRANSACTIONS
    )
