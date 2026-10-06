from fastapi import APIRouter, Response, status

from app.api.deps import DB, CurrentUser
from app.models import User
from app.schemas.user import DataExport, UserOut, UserUpdate
from app.services import users as user_service

router = APIRouter(prefix="/me", tags=["me"])


@router.get("", response_model=UserOut)
def get_me(user: CurrentUser) -> User:
    return user


@router.patch("", response_model=UserOut)
def update_me(body: UserUpdate, user: CurrentUser, db: DB) -> User:
    """Change email and/or password (requires the current password). A password change signs out all devices."""
    return user_service.update_profile(db, user, body)


@router.get("/data", response_model=DataExport)
def export_my_data(user: CurrentUser, db: DB) -> DataExport:
    """POPIA access request: everything Mo'Mali stores about you, as JSON."""
    return user_service.export_data(db, user)


@router.delete("", status_code=status.HTTP_204_NO_CONTENT)
def delete_me(user: CurrentUser, db: DB) -> Response:
    """POPIA erasure: permanently deletes the account and all its data."""
    user_service.delete_account(db, user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
