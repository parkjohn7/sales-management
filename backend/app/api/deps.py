from collections.abc import Callable

from fastapi import Depends, Header

from app.api.responses import fail
from app.core.rbac import RoleCode, can_access_owner
from app.core.security import decode_access_token


class Actor:
    def __init__(
        self,
        *,
        user_id: str,
        email: str,
        name: str,
        role: str,
        team_id: str | None = None,
    ) -> None:
        self.user_id = user_id
        self.email = email
        self.name = name
        self.role = role
        self.team_id = team_id

    def can_access_owner(self, owner_id: str | None) -> bool:
        return can_access_owner(self.role, self.user_id, owner_id)


def get_current_actor(authorization: str | None = Header(default=None)) -> Actor:
    if not authorization or not authorization.lower().startswith("bearer "):
        raise fail(401, "UNAUTHENTICATED", "Bearer token is required")
    token = authorization.split(" ", 1)[1]
    try:
        payload = decode_access_token(token)
    except ValueError as exc:
        raise fail(401, "UNAUTHENTICATED", str(exc)) from exc

    return Actor(
        user_id=str(payload["sub"]),
        email=str(payload.get("email", "")),
        name=str(payload.get("name", "")),
        role=str(payload.get("role", RoleCode.SALES_REP)),
        team_id=payload.get("team_id"),
    )


def require_roles(*roles: RoleCode) -> Callable[[Actor], Actor]:
    allowed = {role.value for role in roles}

    def dependency(actor: Actor = Depends(get_current_actor)) -> Actor:
        if actor.role not in allowed:
            raise fail(403, "FORBIDDEN", "권한이 없습니다.", {"allowed_roles": sorted(allowed)})
        return actor

    return dependency
