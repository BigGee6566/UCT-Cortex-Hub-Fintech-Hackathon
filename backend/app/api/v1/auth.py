from typing import Annotated

from fastapi import APIRouter, Depends, Response, status
from fastapi.security import OAuth2PasswordRequestForm

from app.api.deps import DB
from app.schemas.auth import RefreshRequest, RegisterRequest, TokenPair
from app.services import auth as auth_service

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/register", response_model=TokenPair, status_code=status.HTTP_201_CREATED)
def register(body: RegisterRequest, db: DB) -> TokenPair:
    """Create an account (seeded with demo budgets and transactions) and sign in."""
    return auth_service.register(db, body.email, body.password)


@router.post("/login", response_model=TokenPair)
def login(form: Annotated[OAuth2PasswordRequestForm, Depends()], db: DB) -> TokenPair:
    """OAuth 2.0 password flow: form fields `username` (the email) and `password`."""
    return auth_service.login(db, form.username, form.password)


@router.post("/refresh", response_model=TokenPair)
def refresh(body: RefreshRequest, db: DB) -> TokenPair:
    """Exchange a refresh token for a new pair. Each refresh token works once."""
    return auth_service.refresh(db, body.refresh_token)


@router.post("/logout", status_code=status.HTTP_204_NO_CONTENT)
def logout(body: RefreshRequest, db: DB) -> Response:
    auth_service.logout(db, body.refresh_token)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
