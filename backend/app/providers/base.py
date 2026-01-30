from __future__ import annotations

from abc import ABC, abstractmethod
from datetime import datetime
from typing import Iterable, Sequence

from app.providers.types import (
    AccountData,
    BalanceData,
    ConsentResponse,
    TokenResponse,
    TransactionData,
)


class OpenBankingProvider(ABC):
    """Abstract provider interface to support multiple Open Banking connectors."""

    @abstractmethod
    async def create_consent(self, *, redirect_uri: str, scopes: Sequence[str]) -> ConsentResponse:
        raise NotImplementedError

    @abstractmethod
    async def get_consent_status(self, *, consent_id: str) -> ConsentResponse:
        raise NotImplementedError

    @abstractmethod
    async def exchange_token(self, *, consent_id: str, authorization_code: str, redirect_uri: str) -> TokenResponse:
        raise NotImplementedError

    @abstractmethod
    async def refresh_token(self, *, refresh_token: str) -> TokenResponse:
        raise NotImplementedError

    @abstractmethod
    async def fetch_accounts(self, *, access_token: str) -> Sequence[AccountData]:
        raise NotImplementedError

    @abstractmethod
    async def fetch_balances(self, *, access_token: str, account_id: str) -> Sequence[BalanceData]:
        raise NotImplementedError

    @abstractmethod
    async def fetch_transactions(self, *, access_token: str, account_id: str, from_date: datetime | None = None) -> Sequence[TransactionData]:
        raise NotImplementedError
