import uuid

import pytest

from tests.conftest import bearer, register


def test_new_accounts_get_the_default_budgets(client):
    budgets = client.get("/api/v1/budgets", headers=bearer(register(client))).json()
    assert len(budgets) == 8
    limits = {b["category"]: b["limit_amount"] for b in budgets}
    assert limits["Food"] == 1200  # a JSON number, not a string
    assert limits["Rent"] == 2500
    assert all(b["period"] == "monthly" for b in budgets)


def test_update_budget_limit(client):
    tokens = register(client)
    food = next(b for b in client.get("/api/v1/budgets", headers=bearer(tokens)).json() if b["category"] == "Food")
    response = client.put(f"/api/v1/budgets/{food['id']}", json={"limit_amount": 950.5}, headers=bearer(tokens))
    assert response.status_code == 200
    assert response.json()["limit_amount"] == 950.5
    again = next(b for b in client.get("/api/v1/budgets", headers=bearer(tokens)).json() if b["category"] == "Food")
    assert again["limit_amount"] == 950.5


@pytest.mark.parametrize("amount", [-1, 1_000_000.01, 12.345, "abc"])
def test_invalid_limits_are_rejected(client, amount):
    tokens = register(client)
    budget_id = client.get("/api/v1/budgets", headers=bearer(tokens)).json()[0]["id"]
    response = client.put(f"/api/v1/budgets/{budget_id}", json={"limit_amount": amount}, headers=bearer(tokens))
    assert response.status_code == 422


def test_other_users_budgets_look_like_missing_ones(client):
    alice = register(client, email="alice@uni.ac.za")
    bob = register(client, email="bob@uni.ac.za")
    alice_budget = client.get("/api/v1/budgets", headers=bearer(alice)).json()[0]["id"]

    hijack = client.put(f"/api/v1/budgets/{alice_budget}", json={"limit_amount": 1}, headers=bearer(bob))
    missing = client.put(f"/api/v1/budgets/{uuid.uuid4()}", json={"limit_amount": 1}, headers=bearer(bob))
    assert hijack.status_code == missing.status_code == 404
    assert hijack.json() == missing.json()
