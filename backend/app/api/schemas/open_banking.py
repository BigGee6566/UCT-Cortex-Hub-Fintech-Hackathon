from __future__ import annotations

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from pydantic import AnyUrl, BaseModel, EmailStr, Field


class ConsentCreateRequest(BaseModel):
    user_id: Optional[UUID] = None
    user_external_id: Optional[str] = None
    email: Optional[EmailStr] = None
    redirect_uri: AnyUrl
    scopes: Optional[List[str]] = None


class ConsentResponse(BaseModel):
    id: UUID
    user_id: UUID
    consent_id: str
    status: str
    authorization_url: Optional[str]
    expires_at: Optional[datetime]


class ConsentStatusResponse(BaseModel):
    id: UUID
    user_id: UUID
    consent_id: str
    status: str
    expires_at: Optional[datetime]
    authorized_at: Optional[datetime]
    revoked_at: Optional[datetime]


class AuthorizationCallbackRequest(BaseModel):
    model_config = {"populate_by_name": True}
    consent_id: str
    authorization_code: Optional[str] = Field(None, alias="code")
    redirect_uri: Optional[AnyUrl] = None
    user_id: Optional[UUID] = None


class TokenRefreshRequest(BaseModel):
    user_id: UUID
    consent_id: str


class SyncRequest(BaseModel):
    user_id: UUID
    consent_id: str


class SyncResponse(BaseModel):
    synced: int


class TokenResponse(BaseModel):
    access_token_expires_at: Optional[datetime]
    scope: Optional[str]
    token_type: Optional[str]
