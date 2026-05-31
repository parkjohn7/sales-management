from fastapi import APIRouter

from app.api.responses import ok
from app.core.security import create_access_token
from app.schemas.domain import DevTokenRequest

router = APIRouter()


@router.post("/dev-token")
def create_dev_token(payload: DevTokenRequest) -> dict:
    token = create_access_token(
        {
            "sub": payload.user_id,
            "email": payload.email,
            "name": payload.name,
            "role": payload.role,
            "team_id": payload.team_id,
        }
    )
    return ok(
        {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": payload.user_id,
                "email": payload.email,
                "name": payload.name,
                "role": payload.role,
                "team_id": payload.team_id,
            },
        }
    )
