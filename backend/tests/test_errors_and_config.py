import logging

import pytest
from pydantic import ValidationError

from app.core.config import Settings
from app.services import audit
from tests.conftest import bearer, register


def test_unknown_routes_and_methods_use_the_standard_error_format(client):
    assert client.get("/api/v1/nope").json() == {
        "error": {"code": "not_found", "message": "We couldn't find what you were looking for."}
    }
    assert client.delete("/health").json()["error"]["code"] == "method_not_allowed"


def test_unexpected_errors_are_friendly_and_leak_nothing(client, monkeypatch, caplog):
    tokens = register(client)

    def explode(*args, **kwargs):
        raise RuntimeError("database detail for student@uni.ac.za")

    monkeypatch.setattr("app.services.users.export_data", explode)
    # The default test client re-raises any exception that escapes the app. Getting a response back
    # proves the error was handled inside the app and never reaches the server's traceback logging.
    with caplog.at_level(logging.ERROR):
        response = client.get("/api/v1/me/data", headers=bearer(tokens))

    assert response.status_code == 500
    assert response.headers["X-Request-ID"] == response.json()["error"]["reference"]
    error = response.json()["error"]
    assert error["code"] == "internal_error"
    assert error["message"] == "Something went wrong on our side. Your data is safe. Please try again."
    assert len(error["reference"]) == 32
    assert "student@uni.ac.za" not in response.text and "Traceback" not in response.text
    # The log names the error type and reference, but not the message (which may hold personal data).
    logged = " ".join(r.getMessage() for r in caplog.records if r.name == "momali.errors")
    assert "RuntimeError" in logged and error["reference"] in logged
    assert "student@uni.ac.za" not in logged


def test_audit_details_refuse_personal_data():
    with pytest.raises(ValueError, match="Audit details"):
        audit.record(None, "user.updated", user_id=None, details={"email": "student@uni.ac.za"})  # type: ignore[arg-type]


def test_production_refuses_placeholder_jwt_secret():
    with pytest.raises(ValidationError, match="placeholder"):
        Settings(
            app_env="production",
            database_url="postgresql+psycopg://x@y/z",
            jwt_secret="change-me-to-a-long-random-string-of-32+",
        )


def test_cors_origins_accept_a_comma_separated_list():
    settings = Settings(
        database_url="postgresql+psycopg://x@y/z", jwt_secret="s" * 40, cors_origins="http://a.test, http://b.test"
    )
    assert settings.cors_origins == ["http://a.test", "http://b.test"]
