from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor, require_roles
from app.api.responses import ok
from app.core.rbac import RoleCode
from app.db.session import get_db
from app.models import AuditLog
from app.schemas import AdminSettingsUpdate, AuditLogRead, RolePolicyRead
from app.services.admin_settings_service import read_admin_settings, save_admin_settings
from app.services.audit_service import record_audit_log

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
