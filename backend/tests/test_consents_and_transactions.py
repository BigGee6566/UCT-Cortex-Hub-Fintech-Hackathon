import uuid

from tests.conftest import bearer, grant, register, scalar


def test_transactions_require_consent(client):
    tokens = register(client)
    response = client.get("/api/v1/transactions", headers=bearer(tokens))
    assert response.status_code == 403
    assert response.json()["error"] == {
        "code": "consent_required",
        "message": "Allow Transactions access to use this feature.",
    }


def test_granted_consent_unlocks_demo_transactions_newest_first(client):
    tokens = register(client)
    grant(client, tokens)
    rows = client.get("/api/v1/transactions", headers=bearer(tokens)).json()
    assert len(rows) == 10
    assert rows[0]["description"] == "Rent Contribution"  # 2026-01-16, the newest
    assert rows[-1]["description"] == "NSFAS Allowance"
    assert all(r["amount"] > 0 for r in rows)
    assert {r["type"] for r in rows} == {"income", "expense"}


def test_transactions_pagination_and_limits(client):
    tokens = register(client)
    grant(client, tokens)
    first = client.get("/api/v1/transactions?limit=3", headers=bearer(tokens)).json()
    next_page = client.get("/api/v1/transactions?limit=3&offset=3", headers=bearer(tokens)).json()
    assert len(first) == len(next_page) == 3
    assert not {r["id"] for r in first} & {r["id"] for r in next_page}
    for bad in ("limit=0", "limit=501", "offset=-1"):
        assert client.get(f"/api/v1/transactions?{bad}", headers=bearer(tokens)).status_code == 422


def test_granting_twice_returns_the_same_active_grant(client):
    tokens = register(client)
    first = client.post("/api/v1/consents", json={"scope": "balances:read"}, headers=bearer(tokens))
    second = client.post("/api/v1/consents", json={"scope": "balances:read"}, headers=bearer(tokens))
    assert (first.status_code, second.status_code) == (201, 200)
    assert first.json()["id"] == second.json()["id"]
    assert first.json()["active"] is True


def test_unknown_scope_is_rejected(client):
    tokens = register(client)
    assert client.post("/api/v1/consents", json={"scope": "accounts:write"}, headers=bearer(tokens)).status_code == 422


def test_revoking_consent_locks_data_again_and_keeps_history(client):
    tokens = register(client)
    consent = grant(client, tokens)
    assert client.delete(f"/api/v1/consents/{consent['id']}", headers=bearer(tokens)).status_code == 204
    assert client.get("/api/v1/transactions", headers=bearer(tokens)).status_code == 403
    assert client.delete(f"/api/v1/consents/{consent['id']}", headers=bearer(tokens)).status_code == 204  # idempotent

    history = client.get("/api/v1/consents", headers=bearer(tokens)).json()
    assert [(c["scope"], c["active"]) for c in history] == [("transactions:read", False)]
    assert history[0]["revoked_at"] is not None

    regranted = grant(client, tokens)  # a new grant row; the revoked one stays as history
    assert regranted["id"] != consent["id"]
    assert len(client.get("/api/v1/consents", headers=bearer(tokens)).json()) == 2


def test_consent_actions_are_audited_without_personal_data(client):
    tokens = register(client)
    consent = grant(client, tokens)
    client.delete(f"/api/v1/consents/{consent['id']}", headers=bearer(tokens))
    rows = scalar(
        "SELECT json_agg(json_build_object('a', action, 'm', metadata) ORDER BY timestamp) "
        "FROM audit_logs WHERE action LIKE 'consent.%'"
    )
    assert rows == [
        {"a": "consent.granted", "m": {"scope": "transactions:read"}},
        {"a": "consent.revoked", "m": {"scope": "transactions:read"}},
    ]
    assert scalar("SELECT count(*) FROM audit_logs WHERE metadata::text LIKE '%uni.ac.za%'") == 0


def test_users_cannot_touch_each_others_consents_or_data(client):
    alice = register(client, email="alice@uni.ac.za")
    bob = register(client, email="bob@uni.ac.za")
    alice_consent = grant(client, alice)
    grant(client, bob)

    assert client.delete(f"/api/v1/consents/{alice_consent['id']}", headers=bearer(bob)).status_code == 404
    assert client.delete(f"/api/v1/consents/{uuid.uuid4()}", headers=bearer(bob)).status_code == 404
    alice_ids = {r["id"] for r in client.get("/api/v1/transactions", headers=bearer(alice)).json()}
    bob_ids = {r["id"] for r in client.get("/api/v1/transactions", headers=bearer(bob)).json()}
    assert len(alice_ids) == len(bob_ids) == 10
    assert not alice_ids & bob_ids
