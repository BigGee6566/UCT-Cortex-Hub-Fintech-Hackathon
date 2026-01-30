from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Any, Sequence
from urllib.parse import urlencode

import httpx

from app.core.config import get_settings
from app.providers.base import OpenBankingProvider
from app.providers.types import AccountData, BalanceData, ConsentResponse, TokenResponse, TransactionData


class FinHubProvider(OpenBankingProvider):
    """UCT FinHub Open Banking Sandbox provider implementation (AIS-only).

    This implementation follows common Open Banking patterns and is fully
    configurable through OB_BASE_URL and related settings.
    """

    def __init__(self) -> None:
        self.settings = get_settings()
        self.base_url = str(self.settings.OB_BASE_URL).rstrip("/")

    def _build_url(self, path: str) -> str:
        if not path.startswith("/"):
            path = "/" + path
        return f"{self.base_url}{path}"

    def _common_headers(self) -> dict[str, str]:
        # The sandbox accepts this header when simulating mTLS enrollment.
        return {
            "X-Client-Cert": self.settings.MTLS_HEADER_VALUE,
            "X-Forwarded-Client-Cert": self.settings.MTLS_HEADER_VALUE,
            "Content-Type": "application/json",
            "Accept": "application/json",
        }

    def _auth_headers(self, access_token: str) -> dict[str, str]:
        headers = self._common_headers()
        headers["Authorization"] = f"Bearer {access_token}"
        return headers

    async def create_consent(self, *, redirect_uri: str, scopes: Sequence[str]) -> ConsentResponse:
        permissions = self._map_permissions(scopes)
        token = await self._token_request(
            grant_type="client_credentials",
            scope=self._token_scope(permissions),
        )
        payload = {
            "permissions": permissions,
            "expirationDateTime": self._format_expiry(),
        }
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                self._build_url(self.settings.OB_CONSENTS_PATH),
                headers=self._auth_headers(token.access_token),
                json=payload,
            )
        response.raise_for_status()
        data = response.json()
        consent = self._parse_consent_response(data)
        consent.authorization_url = self._build_authorization_url(consent.consent_id, redirect_uri)
        return consent

    async def get_consent_status(self, *, consent_id: str) -> ConsentResponse:
        token = await self._token_request(
            grant_type="client_credentials",
            scope=self._token_scope(),
        )
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self._build_url(f"{self.settings.OB_CONSENTS_PATH}/{consent_id}"),
                headers=self._auth_headers(token.access_token),
            )
        response.raise_for_status()
        data = response.json()
        return self._parse_consent_response(data)

    async def exchange_token(self, *, consent_id: str, authorization_code: str, redirect_uri: str) -> TokenResponse:
        # Sandbox uses consent_id to mint an access token (no auth code exchange).
        token = await self._token_request(
            grant_type="client_credentials",
            scope=self._token_scope(),
            consent_id=consent_id,
        )
        return token

    async def refresh_token(self, *, refresh_token: str) -> TokenResponse:
        return await self._token_request(
            grant_type="refresh_token",
            refresh_token=refresh_token,
            scope=self._token_scope(),
        )

    async def fetch_accounts(self, *, access_token: str) -> Sequence[AccountData]:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self._build_url(self.settings.OB_ACCOUNTS_PATH),
                headers=self._auth_headers(access_token),
            )
        response.raise_for_status()
        data = response.json()
        accounts = data.get("data") if isinstance(data, dict) else data
        if accounts is None:
            accounts = self._extract_list(data, ["accounts", "data", "Account", "Accounts"])
        results: list[AccountData] = []
        for raw in accounts:
            raw_account_id = raw.get("id") or raw.get("accountId") or raw.get("account_id")
            if raw_account_id is None:
                continue
            provider_account_id = str(raw_account_id)
            results.append(
                AccountData(
                    provider_account_id=provider_account_id,
                    name=raw.get("name"),
                    type=raw.get("type"),
                    currency=raw.get("currency"),
                    institution_name=raw.get("bank_code") or raw.get("bankCode"),
                )
            )
        return results

    async def fetch_balances(self, *, access_token: str, account_id: str) -> Sequence[BalanceData]:
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self._build_url(f"{self.settings.OB_ACCOUNTS_PATH}/{account_id}/balances"),
                headers=self._auth_headers(access_token),
            )
        response.raise_for_status()
        data = response.json()
        balances = []
        if isinstance(data, dict) and "current" in data and "available" in data:
            balances.append(data)
        else:
            balances = self._extract_list(data, ["balances", "data", "Balance", "Balances"])
        results: list[BalanceData] = []
        for raw in balances:
            currency = raw.get("currency")
            as_of = self._parse_datetime(raw.get("as_of") or raw.get("asOf") or raw.get("dateTime") or raw.get("date"))
            for balance_type, key in (("current", "current"), ("available", "available")):
                amount_value = raw.get(key)
                if amount_value is None:
                    continue
                try:
                    amount = float(amount_value)
                except (TypeError, ValueError):
                    continue
                results.append(
                    BalanceData(
                        provider_account_id=account_id,
                        balance_type=balance_type,
                        amount=amount,
                        currency=currency,
                        as_of=as_of,
                    )
                )
        return results

    async def fetch_transactions(self, *, access_token: str, account_id: str, from_date: datetime | None = None) -> Sequence[TransactionData]:
        params = {}
        if from_date:
            params["fromDate"] = from_date.date().isoformat()
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.get(
                self._build_url(f"{self.settings.OB_ACCOUNTS_PATH}/{account_id}/transactions"),
                headers=self._auth_headers(access_token),
                params=params,
            )
        response.raise_for_status()
        data = response.json()
        transactions = data.get("data") if isinstance(data, dict) else data
        if transactions is None:
            transactions = self._extract_list(data, ["transactions", "data", "Transaction", "Transactions"])
        results: list[TransactionData] = []
        for raw in transactions:
            amount_value = raw.get("amount")
            currency = raw.get("currency")
            if amount_value is None:
                continue
            try:
                amount = float(amount_value)
            except (TypeError, ValueError):
                continue
            results.append(
                TransactionData(
                    provider_account_id=account_id,
                    provider_transaction_id=str(raw.get("id") or raw.get("transactionId") or raw.get("transaction_id")),
                    amount=amount,
                    currency=currency,
                    description=raw.get("description"),
                    merchant=raw.get("merchant"),
                    category=raw.get("category"),
                    status=raw.get("status"),
                    booked_at=self._parse_datetime(raw.get("booking_date") or raw.get("bookingDateTime") or raw.get("date")),
                    value_date=self._parse_datetime(raw.get("value_date") or raw.get("valueDateTime")),
                )
            )
        return results

    def _parse_consent_response(self, data: Any) -> ConsentResponse:
        consent_id = data.get("ConsentId") or data.get("consentId") or data.get("consent_id") or data.get("id")
        status = data.get("Status") or data.get("status") or data.get("statusCode") or "unknown"
        auth_url = (
            data.get("authorizationUrl")
            or data.get("authorisationUrl")
            or data.get("auth_url")
            or (data.get("links") or {}).get("authorization")
        )
        expires_at = self._parse_datetime(
            data.get("ExpirationDateTime") or data.get("expirationDateTime") or data.get("expires_at") or data.get("expiresAt")
        )
        if not consent_id:
            raise ValueError("Consent response missing consent id")
        return ConsentResponse(
            consent_id=str(consent_id),
            status=str(status),
            authorization_url=auth_url,
            expires_at=expires_at,
        )

    def _parse_token_response(self, data: Any) -> TokenResponse:
        access_token = data.get("access_token") or data.get("accessToken")
        refresh_token = data.get("refresh_token") or data.get("refreshToken")
        if not access_token:
            raise ValueError("Token response missing access token")

        expires_in = data.get("expires_in") or data.get("expiresIn")
        issued_at = datetime.now(timezone.utc)
        expires_at = None
        if expires_in is not None:
            expires_at = issued_at + self._safe_timedelta_seconds(expires_in)

        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type=data.get("token_type") or data.get("tokenType"),
            scope=data.get("scope"),
            expires_at=expires_at,
            issued_at=issued_at,
        )

    def _safe_timedelta_seconds(self, value: Any):
        from datetime import timedelta

        try:
            return timedelta(seconds=int(value))
        except (TypeError, ValueError):
            return timedelta(seconds=0)

    def _parse_datetime(self, value: Any) -> datetime | None:
        if not value:
            return None
        if isinstance(value, datetime):
            return value
        if isinstance(value, (int, float)):
            return datetime.fromtimestamp(value, tz=timezone.utc)
        if isinstance(value, str):
            try:
                return datetime.fromisoformat(value.replace("Z", "+00:00"))
            except ValueError:
                return None
        return None

    def _extract_list(self, data: Any, keys: Sequence[str]) -> list[dict[str, Any]]:
        if isinstance(data, list):
            return data
        if isinstance(data, dict):
            for key in keys:
                if key in data and isinstance(data[key], list):
                    return data[key]
                if key in data and isinstance(data[key], dict):
                    nested = data[key]
                    if isinstance(nested, dict) and "data" in nested and isinstance(nested["data"], list):
                        return nested["data"]
        return []

    def _map_permissions(self, scopes: Sequence[str]) -> list[str]:
        allowed = {
            "ReadAccountsBasic",
            "ReadAccountsDetail",
            "ReadBalances",
            "ReadTransactionsBasic",
            "ReadTransactionsDetail",
            "ReadTransactionsCredits",
            "ReadTransactionsDebits",
            "ReadBeneficiariesBasic",
        }
        mapping = {
            "accounts.read": ["ReadAccountsDetail"],
            "balances.read": ["ReadBalances"],
            "transactions.read": ["ReadTransactionsBasic", "ReadTransactionsCredits", "ReadTransactionsDebits"],
            "transactions.basic": ["ReadTransactionsBasic"],
            "transactions.debits": ["ReadTransactionsDebits"],
            "transactions.credits": ["ReadTransactionsCredits"],
            "beneficiaries.read": ["ReadBeneficiariesBasic"],
        }
        mapped: list[str] = []
        for scope in scopes:
            if scope in allowed:
                mapped.append(scope)
            elif scope in mapping:
                mapped.extend(mapping[scope])
        if not mapped:
            mapped = [
                "ReadAccountsDetail",
                "ReadBalances",
                "ReadTransactionsBasic",
                "ReadTransactionsCredits",
                "ReadTransactionsDebits",
            ]

        # Ensure transaction permission dependencies are satisfied.
        has_basic_or_detail = any(p in mapped for p in ("ReadTransactionsBasic", "ReadTransactionsDetail"))
        has_credit_debit = any(p in mapped for p in ("ReadTransactionsCredits", "ReadTransactionsDebits"))
        if has_basic_or_detail and not has_credit_debit:
            mapped.extend(["ReadTransactionsCredits", "ReadTransactionsDebits"])
        if has_credit_debit and not has_basic_or_detail:
            mapped.append("ReadTransactionsBasic")

        # Preserve order, ensure unique
        return list(dict.fromkeys(mapped))

    def _token_scope(self, permissions: Sequence[str] | None = None) -> str:
        if self.settings.OB_TOKEN_SCOPE:
            return self.settings.OB_TOKEN_SCOPE
        # Sandbox expects standard OAuth scopes (not Open Banking permission strings).
        return "accounts.read balances.read transactions.read"

    def _format_expiry(self) -> str:
        expiry = datetime.now(timezone.utc) + timedelta(days=self.settings.OB_CONSENT_EXPIRY_DAYS)
        return expiry.replace(microsecond=0).isoformat().replace("+00:00", "Z")

    def _build_authorization_url(self, consent_id: str, redirect_uri: str | None) -> str:
        base = self._build_url(self.settings.OB_PSU_AUTHORIZE_PATH)
        params = {"consentId": consent_id}
        if redirect_uri:
            params["redirect_uri"] = redirect_uri
        return f"{base}?{urlencode(params)}"

    async def _token_request(
        self,
        *,
        grant_type: str,
        scope: str,
        consent_id: str | None = None,
        refresh_token: str | None = None,
    ) -> TokenResponse:
        data = {
            "grant_type": grant_type,
            "client_id": self.settings.OB_CLIENT_ID,
            "client_secret": self.settings.OB_CLIENT_SECRET,
            "scope": scope or "",
        }
        if consent_id:
            data["consent_id"] = consent_id
        if refresh_token:
            data["refresh_token"] = refresh_token
        headers = self._common_headers()
        headers["Content-Type"] = "application/x-www-form-urlencoded"
        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                self._build_url(self.settings.OB_TOKEN_PATH),
                headers=headers,
                data=data,
            )
        response.raise_for_status()
        return self._parse_token_response(response.json())
