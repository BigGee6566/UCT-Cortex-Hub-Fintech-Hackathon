import hashlib
from datetime import UTC, datetime, timedelta

import jwt

from app.core.security import create_access_token
from tests.conftest import PASSWORD, bearer, login, register, scalar


def test_register_returns_bearer_tokens(client):
    tokens = register(client)
    assert tokens["token_type"] == "bearer"
    assert tokens["expires_in"] == 15 * 60
    assert client.get("/api/v1/me", headers=bearer(tokens)).json()["email"] == "student@uni.ac.za"


def test_register_normalises_email_and_rejects_duplicates_case_insensitively(client):
    register(client, email="  Student@Uni.AC.ZA ")
    assert login(client, email="student@uni.ac.za").status_code == 200
    duplicate = client.post("/api/v1/auth/register", json={"email": "STUDENT@uni.ac.za", "password": PASSWORD})
    assert duplicate.status_code == 409
    assert duplicate.json()["error"]["code"] == "email_taken"


def test_register_validation_errors_never_echo_the_password(client):
    response = client.post("/api/v1/auth/register", json={"email": "student@uni.ac.za", "password": "Zq9!x"})
    assert response.status_code == 422
    body = response.json()
    assert body["error"]["code"] == "validation_error"
    assert body["error"]["fields"][0]["field"] == "password"
    assert "Zq9!x" not in response.text


def test_register_rejects_invalid_email(client):
    response = client.post("/api/v1/auth/register", json={"email": "not-an-email", "password": PASSWORD})
    assert response.status_code == 422


def test_passwords_are_stored_as_argon2id_hashes(client):
    register(client)
    stored = scalar("SELECT password_hash FROM users")
    assert stored.startswith("$argon2id$")
    assert PASSWORD not in stored


def test_login_success_and_uniform_failure_messages(client):
    register(client)
    assert login(client).status_code == 200

    wrong_password = login(client, password="wrong-password-123")
    unknown_email = login(client, email="nobody@uni.ac.za")
    for response in (wrong_password, unknown_email):
        assert response.status_code == 401
        assert response.headers["WWW-Authenticate"] == "Bearer"
        assert response.json() == {"error": {"code": "invalid_credentials", "message": "Incorrect email or password."}}


def test_protected_routes_reject_missing_bad_expired_and_forged_tokens(client):
    tokens = register(client)
    user_id = scalar("SELECT id FROM users")
    expired, _ = create_access_token(user_id, now=datetime.now(UTC) - timedelta(hours=1))
    forged = jwt.encode(
        {
            "sub": str(user_id),
            "type": "access",
            "iat": datetime.now(UTC),
            "exp": datetime.now(UTC) + timedelta(minutes=5),
        },
        "a-different-secret-that-is-long-enough!!",
        algorithm="HS256",
    )
    unsigned = jwt.encode({"sub": str(user_id), "type": "access"}, key=None, algorithm="none")

    assert client.get("/api/v1/me").json()["error"]["code"] == "not_authenticated"
    for token in ("garbage", expired, forged, unsigned, tokens["refresh_token"]):
        response = client.get("/api/v1/me", headers={"Authorization": f"Bearer {token}"})
        assert response.status_code == 401, token
        assert response.json()["error"]["code"] == "invalid_token"


def test_refresh_tokens_are_stored_only_as_sha256_hashes(client):
    tokens = register(client)
    stored = scalar("SELECT token_hash FROM sessions")
    assert stored == hashlib.sha256(tokens["refresh_token"].encode()).hexdigest()
    assert scalar("SELECT count(*) FROM sessions WHERE token_hash = :t", t=tokens["refresh_token"]) == 0


def test_refresh_rotates_and_each_refresh_token_works_once(client):
    first = register(client)
    second = client.post("/api/v1/auth/refresh", json={"refresh_token": first["refresh_token"]})
    assert second.status_code == 200
    assert second.json()["refresh_token"] != first["refresh_token"]
    assert client.get("/api/v1/me", headers=bearer(second.json())).status_code == 200


def test_reusing_a_rotated_refresh_token_ends_the_whole_login(client):
    first = register(client)
    second = client.post("/api/v1/auth/refresh", json={"refresh_token": first["refresh_token"]}).json()

    # An attacker replays the old token: rejected, and the newer token is revoked too.
    replay = client.post("/api/v1/auth/refresh", json={"refresh_token": first["refresh_token"]})
    assert replay.status_code == 401
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": second["refresh_token"]}).status_code == 401
    assert scalar("SELECT count(*) FROM audit_logs WHERE action = 'session.reuse_detected'") == 1


def test_logout_revokes_the_refresh_token_and_never_reveals_validity(client):
    tokens = register(client)
    assert client.post("/api/v1/auth/logout", json={"refresh_token": tokens["refresh_token"]}).status_code == 204
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]}).status_code == 401
    unknown = client.post("/api/v1/auth/logout", json={"refresh_token": "x" * 40})
    assert unknown.status_code == 204


def test_logging_in_on_two_devices_gives_independent_sessions(client):
    phone = register(client)
    laptop = login(client).json()
    client.post("/api/v1/auth/logout", json={"refresh_token": phone["refresh_token"]})
    assert client.post("/api/v1/auth/refresh", json={"refresh_token": laptop["refresh_token"]}).status_code == 200
