from tests.conftest import PASSWORD, bearer, grant, login, register, scalar


def test_data_export_contains_everything_except_secrets(client):
    tokens = register(client)
    grant(client, tokens)
    response = client.get("/api/v1/me/data", headers=bearer(tokens))
    assert response.status_code == 200
    data = response.json()

    assert data["profile"]["email"] == "student@uni.ac.za"
    assert len(data["budgets"]) == 8
    assert len(data["transactions"]) == 10
    assert [c["scope"] for c in data["consents"]] == ["transactions:read"]
    assert [a["action"] for a in data["activity"]] == ["user.registered", "consent.granted"]
    for secret in ("password_hash", "token_hash", "$argon2", tokens["refresh_token"]):
        assert secret not in response.text
    assert scalar("SELECT count(*) FROM audit_logs WHERE action = 'data.exported'") == 1


def test_account_deletion_erases_data_and_keeps_an_anonymous_trail(client):
    tokens = register(client)
    grant(client, tokens)
    other = register(client, email="other@uni.ac.za")

    assert client.delete("/api/v1/me", headers=bearer(tokens)).status_code == 204

    # The account and everything linked to it is gone.
    assert client.get("/api/v1/me", headers=bearer(tokens)).status_code == 401
    assert login(client, password=PASSWORD).status_code == 401
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}).status_code == 401
    # Only the other user's rows remain (they never granted consent, so no consents at all).
    assert scalar("SELECT count(*) FROM budgets") == 8
    assert scalar("SELECT count(*) FROM transactions") == 10
    assert scalar("SELECT count(*) FROM sessions") == 1
    assert scalar("SELECT count(*) FROM consents") == 0

    # Audit entries survive without a link to the person; the deletion itself is recorded.
    assert scalar("SELECT count(*) FROM audit_logs WHERE action = 'consent.granted' AND user_id IS NULL") == 1
    assert scalar("SELECT count(*) FROM audit_logs WHERE action = 'account.deleted' AND user_id IS NULL") == 1

    # Other users are untouched.
    assert client.get("/api/v1/me", headers=bearer(other)).status_code == 200
