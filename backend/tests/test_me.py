from tests.conftest import PASSWORD, bearer, login, register, scalar


def test_me_never_exposes_the_password_hash(client):
    tokens = register(client)
    body = client.get("/api/v1/me", headers=bearer(tokens)).json()
    assert set(body) == {"id", "email", "created_at", "updated_at"}


def test_changes_require_the_current_password(client):
    tokens = register(client)
    response = client.patch(
        "/api/v1/me", json={"email": "new@uni.ac.za", "current_password": "wrong-one"}, headers=bearer(tokens)
    )
    assert response.status_code == 403
    assert response.json()["error"]["code"] == "current_password_incorrect"


def test_change_email(client):
    tokens = register(client)
    response = client.patch(
        "/api/v1/me", json={"email": "New@Uni.ac.za", "current_password": PASSWORD}, headers=bearer(tokens)
    )
    assert response.status_code == 200
    assert response.json()["email"] == "new@uni.ac.za"
    assert login(client, email="new@uni.ac.za").status_code == 200
    details = scalar("SELECT metadata FROM audit_logs WHERE action = 'user.updated'")
    assert details == {"fields": ["email"]}  # field names only, never the new value


def test_cannot_take_another_users_email(client):
    register(client, email="taken@uni.ac.za")
    tokens = register(client)
    response = client.patch(
        "/api/v1/me", json={"email": "taken@uni.ac.za", "current_password": PASSWORD}, headers=bearer(tokens)
    )
    assert response.status_code == 409


def test_password_change_signs_out_every_device(client):
    tokens = register(client)
    other_device = login(client).json()
    response = client.patch(
        "/api/v1/me", json={"password": "a-brand-new-password", "current_password": PASSWORD}, headers=bearer(tokens)
    )
    assert response.status_code == 200
    for session in (tokens, other_device):
        assert client.post("/api/v1/auth/refresh", json={"refresh_token": session["refresh_token"]}).status_code == 401
    assert login(client, password=PASSWORD).status_code == 401
    assert login(client, password="a-brand-new-password").status_code == 200


def test_update_needs_something_to_change(client):
    tokens = register(client)
    response = client.patch("/api/v1/me", json={"current_password": PASSWORD}, headers=bearer(tokens))
    assert response.status_code == 422
