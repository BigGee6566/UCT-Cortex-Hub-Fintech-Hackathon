from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class SendVerificationCodeRequest(BaseModel):
    email: EmailStr


class SendVerificationCodeResponse(BaseModel):
    masked_email: str
    expires_in_seconds: int


class VerifyCodeRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6, pattern=r"^\d{6}$")


class VerifyCodeResponse(BaseModel):
    verified: bool
