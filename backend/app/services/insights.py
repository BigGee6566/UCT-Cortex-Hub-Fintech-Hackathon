"""Deterministic insights: health score, coach cards and the safe-to-spend formula.

compute_health_score mirrors FRONTEND/MoMali/services/score.service.ts exactly, so the app and the
API give the same score for the same data.
"""

import math
from collections import defaultdict
from collections.abc import Iterable, Mapping
from dataclasses import dataclass
from decimal import ROUND_DOWN, Decimal

from app.models import Transaction

LABEL = "Mo'Mali Coach (demo)"


@dataclass(frozen=True)
class HealthScore:
    score: int
    savings_rate: float
    budget_utilisation: float


def _expenses_by_category(txs: Iterable[Transaction]) -> dict[str, Decimal]:
    totals: dict[str, Decimal] = defaultdict(Decimal)
    for t in txs:
        if t.type == "expense":
            totals[t.category or "Other"] += t.amount
    return totals


def compute_health_score(txs: list[Transaction], budgets: Mapping[str, Decimal]) -> HealthScore:
    income = sum((t.amount for t in txs if t.type == "income"), Decimal(0))
    expenses = sum((t.amount for t in txs if t.type == "expense"), Decimal(0))
    savings_rate = float(max(Decimal(0), income - expenses) / income) if income > 0 else 0.0

    spend = _expenses_by_category(txs)
    utilisation_sum = 0.0
    for category, limit in budgets.items():
        if limit <= 0:
            utilisation_sum += 1  # no budget set: don't punish
            continue
        ratio = float(spend.get(category, Decimal(0)) / limit)
        utilisation_sum += 1 if ratio <= 1 else max(0.0, 1 - (ratio - 1))  # overspending lowers the score
    budget_utilisation = utilisation_sum / len(budgets) if budgets else 1.0

    raw = 100 * (0.6 * budget_utilisation + 0.4 * savings_rate)
    score = math.floor(raw + 0.5)  # JavaScript Math.round, not Python's round-half-to-even
    return HealthScore(
        score=min(100, max(0, score)),
        savings_rate=min(1.0, max(0.0, savings_rate)),
        budget_utilisation=min(1.0, max(0.0, budget_utilisation)),
    )


def rand(amount: Decimal) -> str:
    """R1 200 style: whole rand, space as thousands separator (South African convention)."""
    return "R" + f"{amount:,.0f}".replace(",", " ")


def coach_cards(txs: list[Transaction], budgets: Mapping[str, Decimal]) -> list[dict[str, str]]:
    spend = _expenses_by_category(txs)
    cards: list[dict[str, str]] = []

    if spend:
        top, amount = max(spend.items(), key=lambda kv: kv[1])
        cards.append(
            {
                "id": "top_category",
                "title": "Where your money goes",
                "message": f"Your top spending category is {top} ({rand(amount)}).",
            }
        )

    over = sorted(
        (
            (c, spend.get(c, Decimal(0)) - limit)
            for c, limit in budgets.items()
            if limit > 0 and spend.get(c, Decimal(0)) > limit
        ),
        key=lambda kv: kv[1],
        reverse=True,
    )
    if over:
        category, by = over[0]
        extra = f" and {len(over) - 1} other categor{'y' if len(over) == 2 else 'ies'}" if len(over) > 1 else ""
        cards.append(
            {
                "id": "budget_status",
                "title": "Budgets",
                "message": f"You're over budget on {category} by {rand(by)}{extra}.",
            }
        )
    else:
        cards.append(
            {
                "id": "budget_status",
                "title": "Budgets",
                "message": "You're within budget in every category. Keep it up.",
            }
        )

    income = sum((t.amount for t in txs if t.type == "income"), Decimal(0))
    expenses = sum((t.amount for t in txs if t.type == "expense"), Decimal(0))
    if income > 0:
        kept = max(Decimal(0), income - expenses) / income
        cards.append({"id": "savings", "title": "Savings", "message": f"You've kept {kept:.0%} of your income so far."})
    else:
        cards.append({"id": "savings", "title": "Savings", "message": "No income recorded yet."})
    return cards


def safe_to_spend_per_day(
    available_balance: Decimal,
    reserved_essentials: Decimal,
    emergency_buffer: Decimal,
    days_until_next_income: int,
) -> Decimal | None:
    """(Available balance - reserved essentials - emergency buffer) / days until next income.

    Returns None when there are no days left to divide by, and never a negative amount.
    """
    if days_until_next_income <= 0:
        return None
    per_day = (available_balance - reserved_essentials - emergency_buffer) / days_until_next_income
    return max(Decimal(0), per_day).quantize(Decimal("0.01"), rounding=ROUND_DOWN)  # round down: never overstate
