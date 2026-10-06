"""Shared FastAPI dependencies: database session and the signed-in user."""

from typing import Annotated

from fastapi import Depends
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.errors import unauthorized
from app.core.security import decode_access_token
from app.models import User

# tokenUrl lets the interactive docs (/docs) log in with the OAuth 2.0 password flow.
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)

DB = Annotated[Session, Depends(get_db)]


def get_current_user(db: DB, token: Annotated[str | None, Depends(oauth2_scheme)]) -> User:
    if not token:
        raise unauthorized("not_authenticated", "Please log in to continue.")

    user_id = decode_access_token(token)
    user = db.get(User, user_id) if user_id else None
    if user is None or user.deleted_at is not None:
        raise unauthorized("invalid_token", "Your session has expired. Please log in again.")
    return user


CurrentUser = Annotated[User, Depends(get_current_user)]
