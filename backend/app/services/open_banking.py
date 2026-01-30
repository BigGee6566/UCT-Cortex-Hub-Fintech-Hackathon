from __future__ import annotations

from datetime import datetime, timezone, timedelta
from typing import Sequence

from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import get_settings
from app.core.security import decrypt_token, encrypt_token, hash_token
from app.models.account import Account, Balance, Transaction
from app.models.open_banking import OpenBankingConsent, OpenBankingToken
from app.models.user import User
from app.providers import get_provider
from app.providers.types import AccountData, BalanceData, TransactionData


class ConsentService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.provider = get_provider()
        self.settings = get_settings()

    async def get_or_create_user(self, user_id, external_id: str | None, email: str | None) -> User:
        if user_id:
            result = await self.session.execute(select(User).where(User.id == user_id))
            user = result.scalar_one_or_none()
            if user:
                return user
        if external_id:
            result = await self.session.execute(select(User).where(User.external_id == external_id))
            user = result.scalar_one_or_none()
            if user:
                return user
        if email:
            result = await self.session.execute(select(User).where(User.email == email))
            user = result.scalar_one_or_none()
            if user:
                return user

        user = User(email=email, external_id=external_id)
        self.session.add(user)
        await self.session.flush()
        return user

    async def create_consent(
        self,
        *,
        user_id,
        external_id: str | None,
        email: str | None,
        redirect_uri: str,
        scopes: Sequence[str],
    ) -> tuple[OpenBankingConsent, str | None]:
        user = await self.get_or_create_user(user_id, external_id, email)
        response = await self.provider.create_consent(redirect_uri=redirect_uri, scopes=scopes)

        consent = OpenBankingConsent(
            user_id=user.id,
            provider="finhub",
            consent_id=response.consent_id,
            status=response.status,
            scopes=list(scopes),
            expires_at=response.expires_at,
            redirect_uri=redirect_uri,
        )
        self.session.add(consent)
        await self.session.commit()
        await self.session.refresh(consent)
        return consent, response.authorization_url

    async def update_consent_status(self, consent: OpenBankingConsent) -> OpenBankingConsent:
        response = await self.provider.get_consent_status(consent_id=consent.consent_id)
        consent.status = response.status
        consent.expires_at = response.expires_at or consent.expires_at
        if response.status.lower() in {"authorised", "authorized"} and not consent.authorized_at:
            consent.authorized_at = datetime.now(timezone.utc)
        if response.status.lower() in {"revoked", "rejected"}:
            consent.revoked_at = consent.revoked_at or datetime.now(timezone.utc)
        await self.session.commit()
        await self.session.refresh(consent)
        return consent


class TokenService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.provider = get_provider()
        self.settings = get_settings()

    async def exchange_token(self, consent: OpenBankingConsent, authorization_code: str, redirect_uri: str) -> OpenBankingToken:
        response = await self.provider.exchange_token(
            consent_id=consent.consent_id,
            authorization_code=authorization_code,
            redirect_uri=redirect_uri,
        )
        consent.status = "authorized"
        consent.authorized_at = consent.authorized_at or datetime.now(timezone.utc)
        await self.session.commit()
        return await self._upsert_token(consent, response)

    async def refresh_token(self, token: OpenBankingToken) -> OpenBankingToken:
        refresh_plain = decrypt_token(token.refresh_token_encrypted)
        response = await self.provider.refresh_token(refresh_token=refresh_plain)
        return await self._upsert_token(token.consent, response, previous_token=token)

    async def refresh_token_with_plaintext(self, token: OpenBankingToken, refresh_token_plaintext: str) -> OpenBankingToken:
        response = await self.provider.refresh_token(refresh_token=refresh_token_plaintext)
        return await self._upsert_token(token.consent, response, previous_token=token)

    async def _upsert_token(self, consent: OpenBankingConsent, response, previous_token: OpenBankingToken | None = None) -> OpenBankingToken:
        if response.refresh_token:
            encrypted_refresh = encrypt_token(response.refresh_token)
            refresh_hash = hash_token(response.refresh_token)
        elif previous_token:
            encrypted_refresh = previous_token.refresh_token_encrypted
            refresh_hash = previous_token.refresh_token_hash
        else:
            raise ValueError("Token response missing refresh token and no previous token to reuse")

        rotated_at = None
        if previous_token and previous_token.refresh_token_hash != refresh_hash:
            rotated_at = datetime.now(timezone.utc)
        elif previous_token:
            rotated_at = previous_token.rotated_at

        values = {
            "user_id": consent.user_id,
            "consent_id": consent.id,
            "provider": consent.provider,
            "access_token": response.access_token,
            "refresh_token_encrypted": encrypted_refresh,
            "refresh_token_hash": refresh_hash,
            "token_type": response.token_type,
            "scope": response.scope,
            "expires_at": response.expires_at,
            "issued_at": response.issued_at,
            "revoked_at": None,
            "rotated_at": rotated_at,
        }

        stmt = (
            insert(OpenBankingToken)
            .values(**values)
            .on_conflict_do_update(
                index_elements=[OpenBankingToken.consent_id, OpenBankingToken.provider],
                set_=values,
            )
            .returning(OpenBankingToken)
        )
        result = await self.session.execute(stmt)
        await self.session.commit()
        token = result.scalar_one()
        return token

    async def get_active_token(self, consent: OpenBankingConsent) -> OpenBankingToken | None:
        result = await self.session.execute(
            select(OpenBankingToken).where(OpenBankingToken.consent_id == consent.id).order_by(OpenBankingToken.issued_at.desc())
        )
        return result.scalars().first()

    async def ensure_valid_token(self, consent: OpenBankingConsent) -> OpenBankingToken | None:
        token = await self.get_active_token(consent)
        if not token:
            return None

        if token.expires_at:
            now = datetime.now(timezone.utc)
            if token.expires_at <= now + timedelta(seconds=self.settings.TOKEN_REFRESH_SAFETY_WINDOW):
                token = await self.refresh_token(token)
        return token


class SyncService:
    def __init__(self, session: AsyncSession):
        self.session = session
        self.provider = get_provider()
        self.settings = get_settings()

    async def sync_accounts(self, user_id, consent: OpenBankingConsent, access_token: str) -> int:
        accounts = await self.provider.fetch_accounts(access_token=access_token)
        return await self._upsert_accounts(user_id, consent, accounts)

    async def sync_balances(self, user_id, accounts: Sequence[Account], access_token: str) -> int:
        count = 0
        for account in accounts:
            balances = await self.provider.fetch_balances(access_token=access_token, account_id=account.provider_account_id)
            count += await self._upsert_balances(user_id, account, balances)
        return count

    async def sync_transactions(self, user_id, accounts: Sequence[Account], access_token: str, from_date: datetime | None = None) -> int:
        count = 0
        for account in accounts:
            transactions = await self.provider.fetch_transactions(
                access_token=access_token,
                account_id=account.provider_account_id,
                from_date=from_date,
            )
            count += await self._upsert_transactions(user_id, account, transactions)
        return count

    async def _upsert_accounts(self, user_id, consent: OpenBankingConsent, accounts: Sequence[AccountData]) -> int:
        count = 0
        for account in accounts:
            values = {
                "user_id": user_id,
                "consent_id": consent.id,
                "provider": consent.provider,
                "provider_account_id": account.provider_account_id,
                "name": account.name,
                "type": account.type,
                "currency": account.currency,
                "institution_name": account.institution_name,
            }
            stmt = (
                insert(Account)
                .values(**values)
                .on_conflict_do_update(
                    index_elements=[Account.user_id, Account.provider, Account.provider_account_id],
                    set_=values,
                )
            )
            await self.session.execute(stmt)
            count += 1
        await self.session.commit()
        return count

    async def _upsert_balances(self, user_id, account: Account, balances: Sequence[BalanceData]) -> int:
        count = 0
        for balance in balances:
            values = {
                "user_id": user_id,
                "account_id": account.id,
                "balance_type": balance.balance_type,
                "amount": balance.amount,
                "currency": balance.currency,
                "as_of": balance.as_of,
            }
            stmt = (
                insert(Balance)
                .values(**values)
                .on_conflict_do_update(
                    index_elements=[Balance.account_id, Balance.balance_type, Balance.as_of],
                    set_=values,
                )
            )
            await self.session.execute(stmt)
            count += 1
        await self.session.commit()
        return count

    async def _upsert_transactions(self, user_id, account: Account, transactions: Sequence[TransactionData]) -> int:
        count = 0
        for tx in transactions:
            values = {
                "user_id": user_id,
                "account_id": account.id,
                "provider": account.provider,
                "provider_transaction_id": tx.provider_transaction_id,
                "amount": tx.amount,
                "currency": tx.currency,
                "description": tx.description,
                "merchant": tx.merchant,
                "category": tx.category,
                "status": tx.status,
                "booked_at": tx.booked_at,
                "value_date": tx.value_date,
            }
            stmt = (
                insert(Transaction)
                .values(**values)
                .on_conflict_do_update(
                    index_elements=[Transaction.account_id, Transaction.provider, Transaction.provider_transaction_id],
                    set_=values,
                )
            )
            await self.session.execute(stmt)
            count += 1
        await self.session.commit()
        return count
