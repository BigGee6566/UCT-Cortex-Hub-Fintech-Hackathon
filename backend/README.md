# Mo'Mali API

FastAPI + PostgreSQL backend for Mo'Mali: accounts, budgets, transactions, insights and POPIA-style consent management. See [`docs/architecture.md`](../docs/architecture.md) for the design and what is deliberately deferred.

> **Demo data:** every new account is seeded with the same demo budgets and transactions as the mobile app (an NSFAS allowance and nine expenses). No bank account is connected yet.

Tested with Python 3.13, PostgreSQL 16, FastAPI 0.142, SQLAlchemy 2.1, Alembic 1.20 and Pydantic 2.13 (exact pins in `requirements.txt`).

## Run it

### With Docker (recommended)

From the repository root:

```bash
cp .env.example .env      # set POSTGRES_PASSWORD and JWT_SECRET
docker compose up --build
```

The API is on http://localhost:8000, with interactive docs at http://localhost:8000/docs. The `migrate` service applies database migrations once before the API starts.

> Not verified in the development environment used to write this (no Docker daemon was available). The compose file validates with `docker compose config`, and the image's commands were run outside Docker.

### Without Docker

You need a PostgreSQL 14+ database.

```bash
cd backend
python -m venv .venv && source .venv/bin/activate
pip install -r requirements-dev.txt
cp .env.example .env      # set DATABASE_URL and JWT_SECRET
alembic upgrade head
uvicorn app.main:app --reload --no-access-log
```

## Test and lint

Tests run against a **real PostgreSQL database** and run the real migrations. Each test session drops and recreates the schema in that database, so the test runner refuses to start unless the database name contains `test`.

```bash
createdb momali_test   # an empty database you own
export TEST_DATABASE_URL=postgresql+psycopg://USER:PASSWORD@localhost:5432/momali_test
pytest                 # 48 tests
ruff check . && ruff format --check .
```

The suite covers:
- migrations and model drift;
- auth: tokens, rotation, reuse detection, forged and expired tokens;
- consent enforcement;
- user isolation;
- health-score parity with the app (71 and 68 for the demo data);
- the safe-to-spend formula;
- data export and erasure;
- error responses that leak nothing.

## Endpoints

All under `/api/v1` except `/health`. "Auth" means `Authorization: Bearer <access_token>`.

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/auth/register` | – | Create an account (JSON `email`, `password` ≥ 8 chars); returns tokens |
| POST | `/auth/login` | – | OAuth 2.0 password flow: **form** fields `username` (email) and `password` |
| POST | `/auth/refresh` | – | Swap a refresh token for a new pair; each refresh token works once |
| POST | `/auth/logout` | – | End this login (always 204) |
| GET | `/me` | ✓ | Your profile |
| PATCH | `/me` | ✓ | Change email and/or password (needs `current_password`); a password change signs out all devices |
| GET | `/me/data` | ✓ | **POPIA access:** everything stored about you, as JSON |
| DELETE | `/me` | ✓ | **POPIA erasure:** deletes the account and all its data |
| GET | `/budgets` | ✓ | Your monthly limits |
| PUT | `/budgets/{id}` | ✓ | Change a limit (0–1 000 000, 2 decimals) |
| GET | `/transactions` | ✓ + `transactions:read` | Newest first; `limit` (1–500), `offset` |
| GET | `/insights` | ✓ + `transactions:read` | Health score, coach cards (labelled demo), safe-to-spend status |
| GET | `/consents` | ✓ | Consent history (active and revoked) |
| POST | `/consents` | ✓ | Grant a scope: `balances:read`, `transactions:read`, `income:read`, `debit_orders:read` |
| DELETE | `/consents/{id}` | ✓ | Revoke a grant |
| GET | `/health` | – | 200 when the database answers, 503 otherwise |

Errors always look like `{"error": {"code": "...", "message": "..."}}`. Validation errors add `fields` (names and reasons, never the submitted values). Unexpected errors add a `reference` that matches the `X-Request-ID` response header and the server log.

## Configuration

| Variable | Required | Default | Notes |
|---|---|---|---|
| `DATABASE_URL` | yes | – | e.g. `postgresql+psycopg://user:pass@host:5432/momali` |
| `JWT_SECRET` | yes | – | At least 32 characters. Placeholders are refused when `APP_ENV=production` |
| `APP_ENV` | no | `development` | `production` hides `/docs` |
| `CORS_ORIGINS` | no | `http://localhost:8081` | Comma-separated |
| `ACCESS_TOKEN_MINUTES` | no | `15` | 1–60 |
| `REFRESH_TOKEN_DAYS` | no | `30` | 1–90 |
| `LOG_LEVEL` | no | `INFO` | |

## Privacy and security notes

- **What is stored.** Passwords are stored as Argon2id hashes. Refresh tokens are stored only as SHA-256 hashes. No bank credentials are stored or requested.
- **What is logged.** Request logs contain method, path, status, duration and a request ID, but no IP addresses, query strings, bodies or emails. Run uvicorn with `--no-access-log` (the Docker image does), because uvicorn's own access log records client IPs.
- **Audit trail.** Audit entries record consent grants and revocations, data exports, profile changes (field names only), deletions and token-reuse alarms, and never personal values.
- **Not yet built:** rate limiting on login and registration, email verification and password reset. See [`docs/architecture.md`](../docs/architecture.md#known-gaps).
