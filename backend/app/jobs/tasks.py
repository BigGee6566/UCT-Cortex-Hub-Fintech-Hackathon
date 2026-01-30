from __future__ import annotations

from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.models.account import Account, Balance
from app.models.alert import Alert
from app.models.open_banking import OpenBankingConsent, OpenBankingToken
from app.services.open_banking import SyncService, TokenService


async def refresh_expiring_tokens(session: AsyncSession) -> int:
    """Refresh tokens that are near expiry.

    Returns the number of refreshed tokens.
    """

    settings = get_settings()
    cutoff = datetime.now(timezone.utc) + timedelta(seconds=settings.TOKEN_REFRESH_SAFETY_WINDOW)
    result = await session.execute(
        select(OpenBankingToken).where(OpenBankingToken.expires_at.is_not(None), OpenBankingToken.expires_at <= cutoff)
    )
    tokens = result.scalars().all()
    refreshed = 0
    token_service = TokenService(session)
    for token in tokens:
        try:
            await token_service.refresh_token(token)
            refreshed += 1
        except Exception:
            # Fail softly inside scheduled job; log in higher-level runner.
            continue
    return refreshed


async def sync_accounts_balances_transactions(session: AsyncSession) -> dict[str, int]:
    """Synchronize accounts, balances, and transactions for active consents."""

    result = await session.execute(select(OpenBankingConsent))
    consents = result.scalars().all()

    sync_service = SyncService(session)
    token_service = TokenService(session)

    totals = {"accounts": 0, "balances": 0, "transactions": 0}

    for consent in consents:
        if consent.revoked_at or (consent.expires_at and consent.expires_at < datetime.now(timezone.utc)):
            continue
        if consent.status.lower() not in {"authorised", "authorized"}:
            continue

        token = await token_service.ensure_valid_token(consent)
        if not token:
            continue

        access_token = token.access_token
        totals["accounts"] += await sync_service.sync_accounts(consent.user_id, consent, access_token)

        result_accounts = await session.execute(
            select(Account).where(Account.user_id == consent.user_id, Account.provider == consent.provider)
        )
        accounts = result_accounts.scalars().all()

        totals["balances"] += await sync_service.sync_balances(consent.user_id, accounts, access_token)
        totals["transactions"] += await sync_service.sync_transactions(consent.user_id, accounts, access_token)

    return totals


async def trigger_low_balance_alerts(session: AsyncSession) -> int:
    """Create alerts when balances drop below zero.

    This uses zero as a natural, non-configured threshold to avoid hard-coded
    business rules. Teams can extend this to use user-configured thresholds.
    """

    result = await session.execute(select(Balance))
    balances = result.scalars().all()
    created = 0
    now = datetime.now(timezone.utc)

    for balance in balances:
        if balance.amount >= 0:
            continue

        existing = await session.execute(
            select(Alert).where(
                Alert.account_id == balance.account_id,
                Alert.type == "low_balance",
                Alert.resolved_at.is_(None),
            )
        )
        if existing.scalar_one_or_none():
            continue

        alert = Alert(
            user_id=balance.user_id,
            account_id=balance.account_id,
            type="low_balance",
            message="Account balance is below zero",
            severity="high",
            triggered_at=now,
        )
        session.add(alert)
        created += 1

    await session.commit()
    return created
