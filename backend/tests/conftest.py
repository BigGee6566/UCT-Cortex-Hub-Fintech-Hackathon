"""Tests run against a real PostgreSQL database, migrated with Alembic and emptied before every test.

Point TEST_DATABASE_URL at an empty database whose name contains "test": everything in it is deleted.
"""

import os
from pathlib import Path

from sqlalchemy.engine import make_url

TEST_DATABASE_URL = os.environ.get(
    "TEST_DATABASE_URL", "postgresql+psycopg://momali:momali-local-dev@localhost:54329/momali_test"
)
if "test" not in (make_url(TEST_DATABASE_URL).database or ""):
    raise SystemExit(
        f"Refusing to run: TEST_DATABASE_URL must name a test database, got {make_url(TEST_DATABASE_URL).database!r}"
    )

# Configure the app before it is imported.
os.environ["APP_ENV"] = "test"
os.environ["DATABASE_URL"] = TEST_DATABASE_URL
os.environ["JWT_SECRET"] = "test-only-secret-" + "x" * 32

import pytest  # noqa: E402
from alembic import command  # noqa: E402
from alembic.config import Config  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402
from sqlalchemy import text  # noqa: E402

from app.core.database import engine  # noqa: E402
from app.main import app  # noqa: E402

BACKEND_DIR = Path(__file__).resolve().parents[1]
PASSWORD = "correct-horse-battery"


def alembic_config() -> Config:
    return Config(str(BACKEND_DIR / "alembic.ini"))


@pytest.fixture(scope="session", autouse=True)
def migrated_database():
    config = alembic_config()
    command.downgrade(config, "base")  # also proves the downgrade path works
    command.upgrade(config, "head")
    yield


@pytest.fixture(autouse=True)
def empty_tables():
    with engine.begin() as connection:
        connection.execute(text("TRUNCATE audit_logs, consents, transactions, budgets, sessions, users CASCADE"))
    yield


@pytest.fixture
def client():
    with TestClient(app) as test_client:
        yield test_client


def register(client: TestClient, email: str = "student@uni.ac.za", password: str = PASSWORD) -> dict:
    response = client.post("/api/v1/auth/register", json={"email": email, "password": password})
    assert response.status_code == 201, response.text
    return response.json()


def login(client: TestClient, email: str = "student@uni.ac.za", password: str = PASSWORD):
    return client.post("/api/v1/auth/login", data={"username": email, "password": password})


def bearer(tokens: dict) -> dict:
    return {"Authorization": f"Bearer {tokens['access_token']}"}


def grant(client: TestClient, tokens: dict, scope: str = "transactions:read") -> dict:
    response = client.post("/api/v1/consents", json={"scope": scope}, headers=bearer(tokens))
    assert response.status_code in (200, 201), response.text
    return response.json()


def scalar(sql: str, **params):
    with engine.connect() as connection:
        return connection.execute(text(sql), params).scalar()
