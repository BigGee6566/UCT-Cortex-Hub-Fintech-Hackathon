from datetime import UTC, datetime
from decimal import Decimal

import pytest

from app.models import Transaction
from app.services.insights import compute_health_score, safe_to_spend_per_day
from tests.conftest import bearer, grant, register


def tx(kind: str, amount: str, category: str = "Food") -> Transaction:
    return Transaction(type=kind, amount=Decimal(amount), category=category, date=datetime(2026, 1, 1, tzinfo=UTC))


def test_insights_require_consent(client):
    assert client.get("/api/v1/insights", headers=bearer(register(client))).status_code == 403


def test_demo_data_scores_71_same_as_the_mobile_app(client):
    tokens = register(client)
    grant(client, tokens)
    body = client.get("/api/v1/insights", headers=bearer(tokens)).json()

    assert body["label"] == "Mo'Mali Coach (demo)"
    assert body["health_score"]["score"] == 71
    assert body["health_score"]["budget_utilisation"] == 1.0
    assert body["health_score"]["savings_rate"] == pytest.approx(797 / 2800)
    messages = {c["id"]: c["message"] for c in body["cards"]}
    assert messages == {
        "top_category": "Your top spending category is Rent (R1 200).",
        "budget_status": "You're within budget in every category. Keep it up.",
        "savings": "You've kept 28% of your income so far.",
    }
    assert body["safe_to_spend"]["available"] is False
    assert body["safe_to_spend"]["reason"]


def test_lowering_a_budget_changes_score_like_the_app(client):
    # Mirrors the mobile app: setting Food to R200 drops the demo score from 71 to 68.
    tokens = register(client)
    grant(client, tokens)
    food = next(b for b in client.get("/api/v1/budgets", headers=bearer(tokens)).json() if b["category"] == "Food")
    client.put(f"/api/v1/budgets/{food['id']}", json={"limit_amount": 200}, headers=bearer(tokens))
    body = client.get("/api/v1/insights", headers=bearer(tokens)).json()
    assert body["health_score"]["score"] == 68
    assert {c["id"]: c["message"] for c in body["cards"]}["budget_status"] == "You're over budget on Food by R95."


def test_health_score_edge_cases():
    no_income = compute_health_score([tx("expense", "50")], {"Food": Decimal("100")})
    assert (no_income.score, no_income.savings_rate) == (60, 0.0)

    way_over = compute_health_score([tx("income", "100"), tx("expense", "500")], {"Food": Decimal("100")})
    assert (way_over.score, way_over.budget_utilisation, way_over.savings_rate) == (0, 0.0, 0.0)

    no_budgets = compute_health_score([tx("income", "100")], {})
    assert no_budgets.score == 100  # nothing to overspend, everything saved

    zero_limit = compute_health_score([tx("income", "100"), tx("expense", "10")], {"Food": Decimal("0")})
    assert zero_limit.budget_utilisation == 1.0  # a 0 limit means "no budget", not "overspent"


def test_safe_to_spend_formula():
    # (1 260 - 500 - 200) / 14 days = 40.00 per day
    assert safe_to_spend_per_day(Decimal("1260"), Decimal("500"), Decimal("200"), 14) == Decimal("40.00")
    assert safe_to_spend_per_day(Decimal("100"), Decimal("0"), Decimal("0"), 3) == Decimal("33.33")  # rounds down
    assert safe_to_spend_per_day(Decimal("100"), Decimal("300"), Decimal("0"), 5) == Decimal("0.00")  # never negative
    assert safe_to_spend_per_day(Decimal("100"), Decimal("0"), Decimal("0"), 0) is None  # payday is today
