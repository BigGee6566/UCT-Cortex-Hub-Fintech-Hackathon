from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from fastapi.responses import HTMLResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.open_banking import (
    AuthorizationCallbackRequest,
    ConsentCreateRequest,
    ConsentResponse,
    ConsentStatusResponse,
    SyncRequest,
    SyncResponse,
    TokenRefreshRequest,
    TokenResponse,
)
from app.core.database import get_session
from app.models.account import Account
from app.models.open_banking import OpenBankingConsent
from app.services.open_banking import ConsentService, SyncService, TokenService

router = APIRouter(prefix="/open-banking", tags=["open-banking"])

DEFAULT_SCOPES = [
    "ReadAccountsDetail",
    "ReadBalances",
    "ReadTransactionsBasic",
    "ReadTransactionsCredits",
    "ReadTransactionsDebits",
]


async def _get_consent_or_404(session: AsyncSession, consent_id: str) -> OpenBankingConsent:
    result = await session.execute(select(OpenBankingConsent).where(OpenBankingConsent.consent_id == consent_id))
    consent = result.scalar_one_or_none()
    if not consent:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Consent not found")
    return consent


def _ensure_consent_active(consent: OpenBankingConsent, *, require_authorized: bool = True) -> None:
    now = datetime.now(timezone.utc)
    if consent.revoked_at:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Consent has been revoked")
    if consent.expires_at and consent.expires_at < now:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Consent has expired")
    if require_authorized and consent.status.lower() not in {"authorised", "authorized"}:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Consent not authorized")


def _ensure_user_matches(consent: OpenBankingConsent, user_id) -> None:
    if str(consent.user_id) != str(user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Consent does not belong to user")


@router.post("/consents", response_model=ConsentResponse, status_code=status.HTTP_201_CREATED)
async def create_consent(
    payload: ConsentCreateRequest,
    session: AsyncSession = Depends(get_session),
) -> ConsentResponse:
    if not payload.user_id and not payload.user_external_id and not payload.email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="user_id or user_external_id or email is required",
        )

    scopes = payload.scopes or DEFAULT_SCOPES
    service = ConsentService(session)
    consent, authorization_url = await service.create_consent(
        user_id=payload.user_id,
        external_id=payload.user_external_id,
        email=payload.email,
        redirect_uri=str(payload.redirect_uri),
        scopes=scopes,
    )

    return ConsentResponse(
        id=consent.id,
        user_id=consent.user_id,
        consent_id=consent.consent_id,
        status=consent.status,
        authorization_url=authorization_url,
        expires_at=consent.expires_at,
    )


@router.get("/consents/{consent_id}", response_model=ConsentStatusResponse)
async def get_consent_status(
    consent_id: str,
    session: AsyncSession = Depends(get_session),
) -> ConsentStatusResponse:
    service = ConsentService(session)
    consent = await _get_consent_or_404(session, consent_id)
    consent = await service.update_consent_status(consent)
    return ConsentStatusResponse(
        id=consent.id,
        user_id=consent.user_id,
        consent_id=consent.consent_id,
        status=consent.status,
        expires_at=consent.expires_at,
        authorized_at=consent.authorized_at,
        revoked_at=consent.revoked_at,
    )


@router.post("/authorize/callback", response_model=TokenResponse)
async def authorize_callback(
    payload: AuthorizationCallbackRequest,
    session: AsyncSession = Depends(get_session),
) -> TokenResponse:
    consent = await _get_consent_or_404(session, payload.consent_id)
    consent = await ConsentService(session).update_consent_status(consent)
    _ensure_consent_active(consent, require_authorized=False)
    if payload.user_id:
        _ensure_user_matches(consent, payload.user_id)

    redirect_uri = str(payload.redirect_uri) if payload.redirect_uri else consent.redirect_uri
    if not redirect_uri:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="redirect_uri is required")

    service = TokenService(session)
    token = await service.exchange_token(consent, payload.authorization_code or "", redirect_uri)

    return TokenResponse(
        access_token_expires_at=token.expires_at,
        scope=token.scope,
        token_type=token.token_type,
    )


@router.get("/authorize/callback", response_class=HTMLResponse)
async def authorize_callback_get(
    code: str | None = Query(None),
    authorization_code: str | None = Query(None, alias="authorization_code"),
    consent_id: str | None = Query(None),
    consentId: str | None = Query(None),
    state: str | None = Query(None),
    redirect_uri: str | None = Query(None),
    redirectUri: str | None = Query(None),
    session: AsyncSession = Depends(get_session),
) -> HTMLResponse:
    resolved_consent_id = consent_id or consentId or state
    if not resolved_consent_id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="consent_id is required")

    consent = await _get_consent_or_404(session, resolved_consent_id)
    consent = await ConsentService(session).update_consent_status(consent)
    _ensure_consent_active(consent, require_authorized=False)

    resolved_redirect_uri = redirect_uri or redirectUri or consent.redirect_uri
    if not resolved_redirect_uri:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="redirect_uri is required")

    service = TokenService(session)
    resolved_code = code or authorization_code or ""
    await service.exchange_token(consent, resolved_code, resolved_redirect_uri)

    html = """
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>MoMali Consent Approved</title>
        <style>
          body { font-family: Arial, sans-serif; background: #f6f8fb; color: #0f172a; padding: 32px; }
          .card { max-width: 520px; margin: 0 auto; background: #fff; border-radius: 12px; padding: 24px; box-shadow: 0 12px 30px rgba(15, 23, 42, 0.08); }
          h1 { font-size: 20px; margin-bottom: 8px; }
          p { margin: 0 0 12px; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1>Consent approved</h1>
          <p>Your bank authorization is complete.</p>
          <p>You can now return to the MoMali app.</p>
        </div>
      </body>
    </html>
    """
    return HTMLResponse(content=html, status_code=status.HTTP_200_OK)


@router.post("/tokens/refresh", response_model=TokenResponse)
async def refresh_token(
    payload: TokenRefreshRequest,
    session: AsyncSession = Depends(get_session),
) -> TokenResponse:
    consent = await _get_consent_or_404(session, payload.consent_id)
    consent = await ConsentService(session).update_consent_status(consent)
    _ensure_consent_active(consent)
    _ensure_user_matches(consent, payload.user_id)

    token_service = TokenService(session)
    token = await token_service.ensure_valid_token(consent)
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No token found for consent")

    refreshed = await token_service.refresh_token(token)
    return TokenResponse(
        access_token_expires_at=refreshed.expires_at,
        scope=refreshed.scope,
        token_type=refreshed.token_type,
    )


@router.post("/sync/accounts", response_model=SyncResponse)
async def sync_accounts(
    payload: SyncRequest,
    session: AsyncSession = Depends(get_session),
) -> SyncResponse:
    consent = await _get_consent_or_404(session, payload.consent_id)
    consent = await ConsentService(session).update_consent_status(consent)
    _ensure_consent_active(consent)
    _ensure_user_matches(consent, payload.user_id)

    token_service = TokenService(session)
    token = await token_service.ensure_valid_token(consent)
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No token found for consent")

    sync_service = SyncService(session)
    count = await sync_service.sync_accounts(payload.user_id, consent, token.access_token)
    return SyncResponse(synced=count)


@router.post("/sync/balances", response_model=SyncResponse)
async def sync_balances(
    payload: SyncRequest,
    session: AsyncSession = Depends(get_session),
) -> SyncResponse:
    consent = await _get_consent_or_404(session, payload.consent_id)
    consent = await ConsentService(session).update_consent_status(consent)
    _ensure_consent_active(consent)
    _ensure_user_matches(consent, payload.user_id)

    token_service = TokenService(session)
    token = await token_service.ensure_valid_token(consent)
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No token found for consent")

    result = await session.execute(
        select(Account).where(Account.user_id == payload.user_id, Account.provider == consent.provider)
    )
    accounts = result.scalars().all()
    sync_service = SyncService(session)
    count = await sync_service.sync_balances(payload.user_id, accounts, token.access_token)
    return SyncResponse(synced=count)


@router.post("/sync/transactions", response_model=SyncResponse)
async def sync_transactions(
    payload: SyncRequest,
    session: AsyncSession = Depends(get_session),
) -> SyncResponse:
    consent = await _get_consent_or_404(session, payload.consent_id)
    consent = await ConsentService(session).update_consent_status(consent)
    _ensure_consent_active(consent)
    _ensure_user_matches(consent, payload.user_id)

    token_service = TokenService(session)
    token = await token_service.ensure_valid_token(consent)
    if not token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No token found for consent")

    result = await session.execute(
        select(Account).where(Account.user_id == payload.user_id, Account.provider == consent.provider)
    )
    accounts = result.scalars().all()

    sync_service = SyncService(session)
    count = await sync_service.sync_transactions(payload.user_id, accounts, token.access_token)
    return SyncResponse(synced=count)
