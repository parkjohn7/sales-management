from enum import StrEnum


class RoleCode(StrEnum):
    SUPER_ADMIN = "SUPER_ADMIN"
    SALES_MANAGER = "SALES_MANAGER"
    SALES_REP = "SALES_REP"
    EXECUTIVE = "EXECUTIVE"
    MARKETING_USER = "MARKETING_USER"


WRITE_ROLES = {
    RoleCode.SUPER_ADMIN,
    RoleCode.SALES_MANAGER,
    RoleCode.SALES_REP,
}

ADMIN_ROLES = {RoleCode.SUPER_ADMIN}


def can_access_owner(role: str, actor_id: str, owner_id: str | None) -> bool:
    if role in {RoleCode.SUPER_ADMIN, RoleCode.SALES_MANAGER, RoleCode.EXECUTIVE}:
        return True
    if role == RoleCode.SALES_REP:
        return owner_id in {None, actor_id}
    if role == RoleCode.MARKETING_USER:
        return True
    return False
