from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor
from app.api.responses import fail, ok
from app.db.session import get_db
from app.models import Account, Contact, Opportunity
from app.schemas.domain import (
    AccountCreate,
    AccountRead,
    AccountUpdate,
    ContactRead,
    OpportunityRead,
)
from app.services.audit_service import record_audit_log

router = APIRouter()


def _get_account_or_404(db: Session, account_id: str) -> Account:
    account = db.get(Account, account_id)
    if account is None:
        raise fail(
            404, "ACCOUNT_NOT_FOUND", "고객사를 찾을 수 없습니다.", {"account_id": account_id}
        )
    return account


@router.get("")
def list_accounts(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    keyword: str | None = None,
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    query = db.query(Account)
    if keyword:
        query = query.filter(Account.name.contains(keyword))
    total = query.count()
    accounts = (
        query.order_by(Account.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return ok(
        [AccountRead.model_validate(account).model_dump(mode="json") for account in accounts],
        {"page": page, "page_size": page_size, "total": total},
    )


@router.post("")
def create_account(
    payload: AccountCreate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    account = Account(**payload.model_dump())
    db.add(account)
    db.flush()
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="CREATE",
        resource_type="Account",
        resource_id=account.id,
        after_value=AccountRead.model_validate(account).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(account)
    return ok(AccountRead.model_validate(account).model_dump(mode="json"))


@router.get("/{account_id}")
def get_account(
    account_id: str,
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    account = _get_account_or_404(db, account_id)
    return ok(AccountRead.model_validate(account).model_dump(mode="json"))


@router.patch("/{account_id}")
def update_account(
    account_id: str,
    payload: AccountUpdate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    account = _get_account_or_404(db, account_id)
    before = AccountRead.model_validate(account).model_dump(mode="json")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(account, field, value)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="UPDATE",
        resource_type="Account",
        resource_id=account.id,
        before_value=before,
        after_value=AccountRead.model_validate(account).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(account)
    return ok(AccountRead.model_validate(account).model_dump(mode="json"))


@router.delete("/{account_id}")
def delete_account(
    account_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    account = _get_account_or_404(db, account_id)
    has_contacts = db.query(Contact).filter(Contact.account_id == account_id).first() is not None
    has_opportunities = (
        db.query(Opportunity).filter(Opportunity.account_id == account_id).first() is not None
    )
    if has_contacts or has_opportunities:
        raise fail(
            409,
            "ACCOUNT_HAS_RELATIONS",
            "연결된 연락처 또는 영업기회가 있어 고객사를 삭제할 수 없습니다.",
            {"account_id": account_id},
        )
    before = AccountRead.model_validate(account).model_dump(mode="json")
    db.delete(account)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="DELETE",
        resource_type="Account",
        resource_id=account_id,
        before_value=before,
    )
    db.commit()
    return ok({"id": account_id, "deleted": True})


@router.get("/{account_id}/contacts")
def list_account_contacts(
    account_id: str,
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    _get_account_or_404(db, account_id)
    contacts = db.query(Contact).filter(Contact.account_id == account_id).all()
    return ok([ContactRead.model_validate(contact).model_dump(mode="json") for contact in contacts])


@router.get("/{account_id}/opportunities")
def list_account_opportunities(
    account_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    _get_account_or_404(db, account_id)
    query = db.query(Opportunity).filter(Opportunity.account_id == account_id)
    if actor.role == "SALES_REP":
        query = query.filter(Opportunity.owner_id == actor.user_id)
    opportunities = query.all()
    return ok(
        [
            OpportunityRead.model_validate(opportunity).model_dump(mode="json")
            for opportunity in opportunities
        ]
    )
