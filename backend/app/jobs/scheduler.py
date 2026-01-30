from __future__ import annotations

import asyncio
from datetime import timedelta

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.interval import IntervalTrigger

from app.core.database import AsyncSessionLocal
from app.jobs import tasks


async def _run_with_session(coro):
    async with AsyncSessionLocal() as session:
        return await coro(session)


def start_scheduler() -> AsyncIOScheduler:
    scheduler = AsyncIOScheduler(event_loop=asyncio.get_running_loop(), timezone="UTC")

    scheduler.add_job(
        _run_with_session,
        args=[tasks.refresh_expiring_tokens],
        trigger=IntervalTrigger(minutes=5),
        id="refresh_expiring_tokens",
        replace_existing=True,
    )

    scheduler.add_job(
        _run_with_session,
        args=[tasks.sync_accounts_balances_transactions],
        trigger=IntervalTrigger(minutes=15),
        id="sync_accounts_balances_transactions",
        replace_existing=True,
    )

    scheduler.add_job(
        _run_with_session,
        args=[tasks.trigger_low_balance_alerts],
        trigger=IntervalTrigger(minutes=30),
        id="trigger_low_balance_alerts",
        replace_existing=True,
    )

    scheduler.start()
    return scheduler
