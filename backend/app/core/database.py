from __future__ import annotations

from typing import AsyncGenerator, Tuple
from urllib.parse import parse_qsl, urlencode, urlparse, urlunparse

from sqlalchemy.ext.asyncio import AsyncSession, async_sessionmaker, create_async_engine
from sqlalchemy.orm import declarative_base

from app.core.config import get_settings

Base = declarative_base()


def _make_async_db_url(database_url: str) -> str:
    if database_url.startswith("postgresql+asyncpg://"):
        return database_url
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    return database_url


def _prepare_async_db_url(database_url: str) -> Tuple[str, dict]:
    """Prepare asyncpg URL and connect args, removing unsupported query params."""

    url = _make_async_db_url(database_url)
    parsed = urlparse(url)
    query = dict(parse_qsl(parsed.query, keep_blank_values=True))

    sslmode = query.pop("sslmode", None)
    query.pop("channel_binding", None)

    connect_args: dict = {}
    if sslmode and sslmode.lower() in {"require", "verify-ca", "verify-full"}:
        connect_args["ssl"] = True
    elif sslmode and sslmode.lower() == "disable":
        connect_args["ssl"] = False

    new_query = urlencode(query)
    new_url = urlunparse(parsed._replace(query=new_query))
    return new_url, connect_args


settings = get_settings()
async_url, async_connect_args = _prepare_async_db_url(settings.DATABASE_URL)

engine = create_async_engine(
    async_url,
    pool_pre_ping=True,
    echo=False,
    connect_args=async_connect_args,
)

AsyncSessionLocal = async_sessionmaker(engine, expire_on_commit=False, class_=AsyncSession)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """FastAPI dependency that provides an async SQLAlchemy session."""
    async with AsyncSessionLocal() as session:
        yield session
