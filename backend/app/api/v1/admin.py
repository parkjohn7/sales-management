from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor, require_roles
from app.api.responses import fail, ok
from app.core.rbac import RoleCode
from app.db.session import get_db
from app.models import AuditLog
from app.schemas import (
    AdminSettingsUpdate,
    AuditLogRead,
    LoginCredentialMailRequest,
    LoginCredentialMailResponse,
    LoginUserUpsert,
    RolePolicyRead,
)
from app.services.admin_settings_service import read_admin_settings, save_admin_settings
from app.services.audit_service import record_audit_log
from app.services.mail_service import send_login_credentials_email
from app.services.login_user_service import delete_login_user, list_login_users, upsert_login_user

router = APIRouter()


ROLE_POLICIES = [
    RolePolicyRead(
        role=RoleCode.SUPER_ADMIN,
        data_scope="전체 데이터",
        permissions=["settings:write", "audit:read", "sales:write", "reports:read"],
    ),
    RolePolicyRead(
        role=RoleCode.SALES_MANAGER,
        data_scope="팀 및 담당 데이터",
        permissions=["sales:write", "reports:read"],
    ),
    RolePolicyRead(
        role=RoleCode.SALES_REP,
        data_scope="본인 담당 데이터",
        permissions=["sales:write"],
    ),
    RolePolicyRead(
        role=RoleCode.EXECUTIVE,
        data_scope="전체 집계 데이터",
        permissions=["reports:read"],
    ),
    RolePolicyRead(
        role=RoleCode.MARKETING_USER,
        data_scope="리드 및 캠페인 데이터",
        permissions=["lead:read", "reports:read"],
    ),
]


@router.get("/settings")
def get_admin_settings(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    return ok(read_admin_settings(db).model_dump(mode="json"))


@router.put("/settings")
def update_admin_settings(
    payload: AdminSettingsUpdate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require_roles(RoleCode.SUPER_ADMIN)),
) -> dict:
    before = read_admin_settings(db).model_dump(mode="json")
    settings = save_admin_settings(db, payload, updated_by=actor.user_id)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="UPDATE_SETTINGS",
        resource_type="AdminSetting",
        resource_id="sales_management",
        before_value=before,
        after_value=settings.model_dump(mode="json"),
    )
    db.commit()
    return ok(settings.model_dump(mode="json"))


@router.get("/role-policy")
def get_role_policy(_: Actor = Depends(get_current_actor)) -> dict:
    return ok([policy.model_dump(mode="json") for policy in ROLE_POLICIES])


@router.get("/audit-logs")
def list_audit_logs(
    page_size: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: Actor = Depends(require_roles(RoleCode.SUPER_ADMIN)),
) -> dict:
    logs = db.query(AuditLog).order_by(AuditLog.created_at.desc()).limit(page_size).all()
    return ok([AuditLogRead.model_validate(log).model_dump(mode="json") for log in logs])


@router.post("/notify-login-credential")
def notify_login_credential(
    payload: LoginCredentialMailRequest,
    _: Actor = Depends(require_roles(RoleCode.SUPER_ADMIN)),
) -> dict:
    sent, message = send_login_credentials_email(
        to_email=payload.to_email,
        user_name=payload.user_name,
        temporary_password=payload.temporary_password,
    )
    response = LoginCredentialMailResponse(sent=sent, message=message)
    return ok(response.model_dump(mode="json"))


@router.get("/login-users")
def get_login_users(
    db: Session = Depends(get_db),
    _: Actor = Depends(require_roles(RoleCode.SUPER_ADMIN)),
) -> dict:
    users = [item.model_dump(mode="json") for item in list_login_users(db)]
    db.commit()
    return ok(users)


@router.put("/login-users")
def save_login_user(
    payload: LoginUserUpsert,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require_roles(RoleCode.SUPER_ADMIN)),
) -> dict:
    try:
        user = upsert_login_user(db, payload)
    except ValueError as exc:
        db.rollback()
        raise fail(422, "INVALID_LOGIN_USER", str(exc)) from exc
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="UPSERT_LOGIN_USER",
        resource_type="AdminSetting",
        resource_id=payload.email.strip().lower(),
        after_value=user.model_dump(mode="json"),
    )
    db.commit()
    return ok(user.model_dump(mode="json"))


@router.delete("/login-users/{email}")
def remove_login_user(
    email: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(require_roles(RoleCode.SUPER_ADMIN)),
) -> dict:
    deleted = delete_login_user(db, email)
    if not deleted:
        return ok({"email": email, "deleted": False})
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="DELETE_LOGIN_USER",
        resource_type="AdminSetting",
        resource_id=email.strip().lower(),
    )
    db.commit()
    return ok({"email": email, "deleted": True})
