from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime
from typing import Optional


@dataclass
class ConsentResponse:
    consent_id: str
    status: str
    authorization_url: Optional[str]
    expires_at: Optional[datetime]


@dataclass
class TokenResponse:
    access_token: str
    refresh_token: Optional[str]
    token_type: Optional[str]
    scope: Optional[str]
    expires_at: Optional[datetime]
    issued_at: datetime


@dataclass
class AccountData:
    provider_account_id: str
    name: Optional[str]
    type: Optional[str]
    currency: Optional[str]
    institution_name: Optional[str]


@dataclass
class BalanceData:
    provider_account_id: str
    balance_type: str
    amount: float
    currency: Optional[str]
    as_of: Optional[datetime]


@dataclass
class TransactionData:
    provider_account_id: str
    provider_transaction_id: str
    amount: float
    currency: Optional[str]
    description: Optional[str]
    merchant: Optional[str]
    category: Optional[str]
    status: Optional[str]
    booked_at: Optional[datetime]
    value_date: Optional[datetime]
