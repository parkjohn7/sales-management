from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor
from app.api.responses import fail, ok
from app.core.security import create_access_token
from app.db.session import get_db
from app.schemas import ChangePasswordRequest, DevTokenRequest, LoginRequest
from app.services.login_user_service import (
    authenticate_login_user,
    change_login_user_password,
    list_login_users,
)

router = APIRouter()


def _api_role(role: str) -> str:
    if role == "ADMIN":
        return "SUPER_ADMIN"
    if role == "ORG_MANAGER":
        return "SALES_MANAGER"
    return "SALES_REP"


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


@router.get("/login-users")
def get_login_users(db: Session = Depends(get_db)) -> dict:
    users = [item.model_dump(mode="json") for item in list_login_users(db)]
    db.commit()
    return ok(users)


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> dict:
    user = authenticate_login_user(db, payload.email, payload.password)
    if user is None:
        raise fail(401, "INVALID_CREDENTIAL", "이메일 또는 비밀번호가 올바르지 않습니다.")
    token = create_access_token(
        {
            "sub": user.email,
            "email": user.email,
            "name": user.name,
            "role": _api_role(user.role),
            "team_id": user.organization,
        }
    )
    db.commit()
    return ok(
        {
            "access_token": token,
            "token_type": "bearer",
            "user": user.model_dump(mode="json"),
        }
    )


@router.post("/change-password")
def change_password(
    payload: ChangePasswordRequest,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    if actor.email.lower() != payload.email.strip().lower():
        raise fail(403, "FORBIDDEN", "본인 계정의 비밀번호만 변경할 수 있습니다.")
    success, message = change_login_user_password(
        db,
        email=payload.email,
        current_password=payload.current_password,
        next_password=payload.next_password,
    )
    if success:
        db.commit()
    else:
        db.rollback()
    return ok({"success": success, "message": message})
