from __future__ import annotations

import re

from sqlalchemy.orm import Session

from app.models import AdminSetting
from app.schemas import LoginUserRead, LoginUserUpsert
from app.services.admin_settings_service import SETTINGS_KEY

PASSWORD_RULE = re.compile(
    r"^(?=.{8,}$)(?:(?=.*[A-Za-z])(?=.*\d)|(?=.*[A-Za-z])(?=.*[^A-Za-z0-9])|(?=.*\d)(?=.*[^A-Za-z0-9])).*$"
)

DEFAULT_LOGIN_USERS = [
    {
        "name": "관리자",
        "email": "admin@cherrylab.com",
        "mobile_phone": "010-0000-0001",
        "role": "ADMIN",
        "organization": "본사",
        "title": "시스템 관리자",
        "password": "admin1234",
        "must_change_password": True,
    },
    {
        "name": "조직장 김본부",
        "email": "manager@cherrylab.com",
        "mobile_phone": "010-0000-0002",
        "role": "ORG_MANAGER",
        "organization": "영업본부",
        "title": "영업본부장",
        "password": "manager1234",
        "must_change_password": True,
    },
    {
        "name": "영업담당 박세일즈",
        "email": "sales@cherrylab.com",
        "mobile_phone": "010-0000-0003",
        "role": "SALES_REP",
        "organization": "영업1팀",
        "title": "Account Executive",
        "password": "sales1234",
        "must_change_password": True,
    },
]


def _normalize_email(value: str) -> str:
    return value.strip().lower()


def _ensure_admin_row(db: Session) -> AdminSetting:
    row = db.get(AdminSetting, SETTINGS_KEY)
    if row is None:
        row = AdminSetting(
            key=SETTINGS_KEY,
            value={"login_users": DEFAULT_LOGIN_USERS},
            updated_by="system",
        )
        db.add(row)
        db.flush()
    return row


def _ensure_login_users(db: Session) -> list[dict]:
    row = _ensure_admin_row(db)
    payload = row.value or {}
    users = payload.get("login_users")
    if not isinstance(users, list) or len(users) == 0:
        row.value = {**payload, "login_users": [dict(item) for item in DEFAULT_LOGIN_USERS]}
        db.flush()
        return list(DEFAULT_LOGIN_USERS)
    return users


def list_login_users(db: Session) -> list[LoginUserRead]:
    users = _ensure_login_users(db)
    return [
        LoginUserRead(
            name=str(item.get("name", "")),
            email=_normalize_email(str(item.get("email", ""))),
            mobile_phone=item.get("mobile_phone"),
            role=str(item.get("role", "SALES_REP")),
            organization=str(item.get("organization", "")),
            title=item.get("title"),
            must_change_password=bool(item.get("must_change_password", True)),
        )
        for item in users
        if item.get("email")
    ]


def authenticate_login_user(db: Session, email: str, password: str) -> LoginUserRead | None:
    users = _ensure_login_users(db)
    normalized_email = _normalize_email(email)
    for item in users:
        if _normalize_email(str(item.get("email", ""))) == normalized_email and str(
            item.get("password", "")
        ) == password:
            return LoginUserRead(
                name=str(item.get("name", "")),
                email=normalized_email,
                mobile_phone=item.get("mobile_phone"),
                role=str(item.get("role", "SALES_REP")),
                organization=str(item.get("organization", "")),
                title=item.get("title"),
                must_change_password=bool(item.get("must_change_password", True)),
            )
    return None


def upsert_login_user(db: Session, payload: LoginUserUpsert) -> LoginUserRead:
    row = _ensure_admin_row(db)
    data = row.value or {}
    users = _ensure_login_users(db)
    normalized_email = _normalize_email(payload.email)
    index = next(
        (
            idx
            for idx, user in enumerate(users)
            if _normalize_email(str(user.get("email", ""))) == normalized_email
        ),
        None,
    )
    next_users = [dict(item) for item in users]
    current = next_users[index] if index is not None else {}
    if index is None and (payload.password is None or not PASSWORD_RULE.match(payload.password)):
        raise ValueError("새 사용자 비밀번호는 8자 이상, 2종류 조합이어야 합니다.")
    if payload.password and not PASSWORD_RULE.match(payload.password):
        raise ValueError("비밀번호는 8자 이상, 문자/숫자/특수문자 중 2가지 이상 조합이어야 합니다.")

    next_item = {
        "name": payload.name,
        "email": normalized_email,
        "mobile_phone": payload.mobile_phone or "",
        "role": payload.role,
        "organization": payload.organization,
        "title": payload.title or "",
        "password": payload.password or current.get("password", ""),
        "must_change_password": (
            True if index is None else bool(current.get("must_change_password", True))
        ),
    }

    if index is None:
        next_users.append(next_item)
    else:
        next_users[index] = {**current, **next_item}

    row.value = {**data, "login_users": next_users}
    row.updated_by = "system"
    db.flush()
    return LoginUserRead(
        name=str(next_item["name"]),
        email=str(next_item["email"]),
        mobile_phone=str(next_item["mobile_phone"]) or None,
        role=str(next_item["role"]),
        organization=str(next_item["organization"]),
        title=str(next_item["title"]) or None,
        must_change_password=bool(next_item["must_change_password"]),
    )


def delete_login_user(db: Session, email: str) -> bool:
    row = _ensure_admin_row(db)
    data = row.value or {}
    users = _ensure_login_users(db)
    normalized_email = _normalize_email(email)
    next_users = [
        user
        for user in users
        if _normalize_email(str(user.get("email", ""))) != normalized_email
    ]
    if len(next_users) == len(users):
        return False
    row.value = {
        **data,
        "login_users": next_users or [dict(item) for item in DEFAULT_LOGIN_USERS],
    }
    row.updated_by = "system"
    db.flush()
    return True


def change_login_user_password(
    db: Session,
    *,
    email: str,
    current_password: str,
    next_password: str,
) -> tuple[bool, str]:
    if not PASSWORD_RULE.match(next_password):
        return False, "새 비밀번호는 8자 이상, 문자/숫자/특수문자 중 2가지 이상 조합이어야 합니다."

    row = _ensure_admin_row(db)
    data = row.value or {}
    users = _ensure_login_users(db)
    next_users = [dict(item) for item in users]
    normalized_email = _normalize_email(email)
    for index, user in enumerate(next_users):
        if _normalize_email(str(user.get("email", ""))) != normalized_email:
            continue
        if str(user.get("password", "")) != current_password:
            return False, "현재 비밀번호가 일치하지 않습니다."
        next_users[index] = {
            **user,
            "password": next_password,
            "must_change_password": False,
        }
        row.value = {**data, "login_users": next_users}
        row.updated_by = normalized_email
        db.flush()
        return True, "비밀번호가 변경되었습니다."
    return False, "사용자를 찾을 수 없습니다."
