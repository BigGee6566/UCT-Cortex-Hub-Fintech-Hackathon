"""Database engine and per-request sessions.

There is one primary engine for now. The API keeps no state in memory, so read
replicas can be added later behind get_db without changing any endpoint
(see docs/architecture.md, "Deferred infrastructure").
"""

from collections.abc import Iterator

from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

from app.core.config import get_settings

# pool_pre_ping drops dead connections (e.g. after a database restart) before use.
engine = create_engine(get_settings().database_url, pool_pre_ping=True)

# expire_on_commit=False keeps loaded objects usable for the response after commit.
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


def get_db() -> Iterator[Session]:
    with SessionLocal() as session:
        yield session
