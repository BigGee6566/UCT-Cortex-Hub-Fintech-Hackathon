from __future__ import annotations

from datetime import datetime, timedelta, timezone
import secrets

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.schemas.auth import (
    SendVerificationCodeRequest,
    SendVerificationCodeResponse,
    VerifyCodeRequest,
    VerifyCodeResponse,
)
from app.core.config import get_settings
from app.core.database import get_session
from app.core.security import hash_otp, verify_otp_hash
from app.models.email_verification import EmailVerificationCode
from app.models.user import User
from app.services.email import EmailMessage, EmailService

router = APIRouter(prefix="/auth", tags=["auth"])


def _mask_email(email: str) -> str:
    local, domain = email.split("@", 1)
    if len(local) <= 1:
        masked_local = "*"
    elif len(local) == 2:
        masked_local = local[0] + "*"
    else:
        masked_local = local[0] + "***" + local[-1]
    return f"{masked_local}@{domain}"


def _generate_code() -> str:
    return f"{secrets.randbelow(1_000_000):06d}"


@router.post("/send-verification-code", response_model=SendVerificationCodeResponse, status_code=status.HTTP_200_OK)
async def send_verification_code(
    payload: SendVerificationCodeRequest,
    session: AsyncSession = Depends(get_session),
) -> SendVerificationCodeResponse:
    settings = get_settings()
    email = payload.email.lower().strip()
    now = datetime.now(timezone.utc)

    latest = await session.execute(
        select(EmailVerificationCode)
        .where(EmailVerificationCode.email == email)
        .order_by(EmailVerificationCode.created_at.desc())
        .limit(1)
    )
    latest_code = latest.scalar_one_or_none()

    if latest_code and latest_code.last_sent_at and (now - latest_code.last_sent_at).total_seconds() < settings.OTP_RESEND_MIN_SECONDS:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Please wait before requesting another code.")

    sent_last_hour = await session.execute(
        select(func.count(EmailVerificationCode.id)).where(
            EmailVerificationCode.email == email,
            EmailVerificationCode.created_at >= now - timedelta(hours=1),
        )
    )
    if (sent_last_hour.scalar_one() or 0) >= settings.OTP_MAX_PER_HOUR:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many requests. Please try again later.")

    user_result = await session.execute(select(User).where(User.email == email))
    user = user_result.scalar_one_or_none()
    if not user:
        user = User(email=email)
        session.add(user)
        await session.flush()

    code = _generate_code()
    hashed = hash_otp(code, email=email)
    record = EmailVerificationCode(
        user_id=user.id,
        email=email,
        code_hash=hashed,
        expires_at=now + timedelta(minutes=settings.OTP_EXPIRY_MINUTES),
        attempts=0,
        max_attempts=settings.OTP_MAX_ATTEMPTS,
        last_sent_at=now,
    )
    session.add(record)
    await session.commit()

    subject = "Your MoMali verification code"
    text = f"Your MoMali verification code is {code}. It expires in {settings.OTP_EXPIRY_MINUTES} minutes."
    html = (
        f"<p>Your MoMali verification code is <strong>{code}</strong>.</p>"
        f"<p>This code expires in {settings.OTP_EXPIRY_MINUTES} minutes.</p>"
    )
    await EmailService().send(EmailMessage(to_email=email, subject=subject, text=text, html=html))

    return SendVerificationCodeResponse(masked_email=_mask_email(email), expires_in_seconds=settings.OTP_EXPIRY_MINUTES * 60)


@router.post("/verify-code", response_model=VerifyCodeResponse, status_code=status.HTTP_200_OK)
async def verify_code(
    payload: VerifyCodeRequest,
    session: AsyncSession = Depends(get_session),
) -> VerifyCodeResponse:
    settings = get_settings()
    email = payload.email.lower().strip()
    now = datetime.now(timezone.utc)

    result = await session.execute(
        select(EmailVerificationCode)
        .where(
            EmailVerificationCode.email == email,
            EmailVerificationCode.consumed_at.is_(None),
        )
        .order_by(EmailVerificationCode.created_at.desc())
        .limit(1)
    )
    record = result.scalar_one_or_none()
    if not record:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Verification code not found.")

    if record.expires_at <= now:
        raise HTTPException(status_code=status.HTTP_410_GONE, detail="Verification code has expired.")

    if record.attempts >= record.max_attempts:
        raise HTTPException(status_code=status.HTTP_429_TOO_MANY_REQUESTS, detail="Too many attempts. Request a new code.")

    if not verify_otp_hash(payload.code, email=email, expected_hash=record.code_hash):
        record.attempts += 1
        await session.commit()
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid verification code.")

    record.consumed_at = now
    user_result = await session.execute(select(User).where(User.email == email))
    user = user_result.scalar_one_or_none()
    if user:
        user.email_verified = True
        user.email_verified_at = now
    await session.commit()

    return VerifyCodeResponse(verified=True)
