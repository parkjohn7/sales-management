from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor
from app.api.responses import fail, ok
from app.db.session import get_db
from app.models import Account, Contact
from app.schemas import ContactCreate, ContactRead, ContactUpdate
from app.services.audit_service import record_audit_log

router = APIRouter()


@router.get("")
def list_contacts(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    account_id: str | None = None,
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    query = db.query(Contact)
    if account_id:
        query = query.filter(Contact.account_id == account_id)
    total = query.count()
    contacts = (
        query.order_by(Contact.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return ok(
        [ContactRead.model_validate(contact).model_dump(mode="json") for contact in contacts],
        {"page": page, "page_size": page_size, "total": total},
    )


@router.post("")
def create_contact(
    payload: ContactCreate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    if db.get(Account, payload.account_id) is None:
        raise fail(
            404,
            "ACCOUNT_NOT_FOUND",
            "연락처를 연결할 고객사를 찾을 수 없습니다.",
            {"account_id": payload.account_id},
        )
    contact = Contact(**payload.model_dump())
    db.add(contact)
    db.flush()
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="CREATE",
        resource_type="Contact",
        resource_id=contact.id,
        after_value=ContactRead.model_validate(contact).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(contact)
    return ok(ContactRead.model_validate(contact).model_dump(mode="json"))


@router.get("/{contact_id}")
def get_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    contact = db.get(Contact, contact_id)
    if contact is None:
        raise fail(
            404,
            "CONTACT_NOT_FOUND",
            "연락처를 찾을 수 없습니다.",
            {"contact_id": contact_id},
        )
    return ok(ContactRead.model_validate(contact).model_dump(mode="json"))


@router.patch("/{contact_id}")
def update_contact(
    contact_id: str,
    payload: ContactUpdate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    contact = db.get(Contact, contact_id)
    if contact is None:
        raise fail(
            404,
            "CONTACT_NOT_FOUND",
            "연락처를 찾을 수 없습니다.",
            {"contact_id": contact_id},
        )
    if payload.account_id and db.get(Account, payload.account_id) is None:
        raise fail(
            404,
            "ACCOUNT_NOT_FOUND",
            "연락처를 연결할 고객사를 찾을 수 없습니다.",
            {"account_id": payload.account_id},
        )

    before_value = ContactRead.model_validate(contact).model_dump(mode="json")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(contact, field, value)
    db.flush()
    after_value = ContactRead.model_validate(contact).model_dump(mode="json")
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="UPDATE",
        resource_type="Contact",
        resource_id=contact.id,
        before_value=before_value,
        after_value=after_value,
    )
    db.commit()
    db.refresh(contact)
    return ok(ContactRead.model_validate(contact).model_dump(mode="json"))


@router.delete("/{contact_id}")
def delete_contact(
    contact_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    contact = db.get(Contact, contact_id)
    if contact is None:
        raise fail(
            404,
            "CONTACT_NOT_FOUND",
            "연락처를 찾을 수 없습니다.",
            {"contact_id": contact_id},
        )
    before_value = ContactRead.model_validate(contact).model_dump(mode="json")
    db.delete(contact)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="DELETE",
        resource_type="Contact",
        resource_id=contact_id,
        before_value=before_value,
    )
    db.commit()
    return ok({"id": contact_id, "deleted": True})
