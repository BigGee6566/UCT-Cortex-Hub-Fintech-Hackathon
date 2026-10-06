import uuid

from fastapi import APIRouter, Response, status

from app.api.deps import DB, CurrentUser
from app.models import Consent
from app.schemas.consent import ConsentCreate, ConsentOut
from app.services import consents as consent_service

router = APIRouter(prefix="/consents", tags=["consents"])


@router.get("", response_model=list[ConsentOut])
def list_consents(user: CurrentUser, db: DB) -> list[Consent]:
    """All grants, newest first, including revoked ones (your consent history)."""
    return consent_service.list_consents(db, user.id)


@router.post("", response_model=ConsentOut, status_code=status.HTTP_201_CREATED)
def grant_consent(body: ConsentCreate, user: CurrentUser, db: DB, response: Response) -> Consent:
    """Grant one scope. 201 when created, 200 when that scope was already active."""
    consent, created = consent_service.grant(db, user.id, body.scope)
    if not created:
        response.status_code = status.HTTP_200_OK
    return consent


@router.delete("/{consent_id}", status_code=status.HTTP_204_NO_CONTENT)
def revoke_consent(consent_id: uuid.UUID, user: CurrentUser, db: DB) -> Response:
    consent_service.revoke(db, user.id, consent_id)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
