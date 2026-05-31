from decimal import Decimal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor
from app.api.responses import fail, ok
from app.db.session import get_db
from app.models import Lead
from app.schemas import LeadAssignRequest, LeadConvertRequest, LeadCreate, LeadRead, LeadUpdate
from app.services.audit_service import record_audit_log
from app.services.lead_conversion_service import convert_lead
from app.services.lead_scoring_service import LeadScoringInput, score_and_grade

router = APIRouter()


def _score_lead(lead: Lead) -> None:
    score, grade = score_and_grade(
        LeadScoringInput(
            budget_confirmed=lead.budget_confirmed,
            authority_confirmed=lead.authority_confirmed,
            timeline_within_3_months=lead.timeline_within_3_months,
            price_page_visit_count=lead.price_page_visit_count,
            downloaded_material=lead.downloaded_material,
        )
    )
    lead.lead_score = score
    lead.lead_grade = grade


def _get_lead_or_404(db: Session, lead_id: str) -> Lead:
    lead = db.get(Lead, lead_id)
    if lead is None:
        raise fail(404, "LEAD_NOT_FOUND", "리드를 찾을 수 없습니다.", {"lead_id": lead_id})
    return lead


@router.get("")
def list_leads(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    source_channel: str | None = None,
    grade: str | None = None,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    query = db.query(Lead)
    if actor.role == "SALES_REP":
        query = query.filter(Lead.owner_id == actor.user_id)
    if source_channel:
        query = query.filter(Lead.source_channel == source_channel)
    if grade:
        query = query.filter(Lead.lead_grade == grade.upper())
    total = query.count()
    leads = (
        query.order_by(Lead.created_at.desc()).offset((page - 1) * page_size).limit(page_size).all()
    )
    return ok(
        [LeadRead.model_validate(lead).model_dump(mode="json") for lead in leads],
        {"page": page, "page_size": page_size, "total": total},
    )


@router.post("")
def create_lead(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    owner_id = payload.owner_id or actor.user_id
    if actor.role == "SALES_REP" and owner_id != actor.user_id:
        raise fail(403, "FORBIDDEN", "영업 담당자는 본인 리드만 생성할 수 있습니다.")
    lead = Lead(**payload.model_dump(exclude={"owner_id"}), owner_id=owner_id)
    _score_lead(lead)
    db.add(lead)
    db.flush()
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="CREATE",
        resource_type="Lead",
        resource_id=lead.id,
        after_value=LeadRead.model_validate(lead).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(lead)
    return ok(LeadRead.model_validate(lead).model_dump(mode="json"))


@router.get("/{lead_id}")
def get_lead(
    lead_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    lead = _get_lead_or_404(db, lead_id)
    if not actor.can_access_owner(lead.owner_id):
        raise fail(403, "FORBIDDEN", "리드 접근 권한이 없습니다.")
    return ok(LeadRead.model_validate(lead).model_dump(mode="json"))


@router.patch("/{lead_id}")
def update_lead(
    lead_id: str,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    lead = _get_lead_or_404(db, lead_id)
    if not actor.can_access_owner(lead.owner_id):
        raise fail(403, "FORBIDDEN", "리드 수정 권한이 없습니다.")
    before = LeadRead.model_validate(lead).model_dump(mode="json")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(lead, field, value)
    _score_lead(lead)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="UPDATE",
        resource_type="Lead",
        resource_id=lead.id,
        before_value=before,
        after_value=LeadRead.model_validate(lead).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(lead)
    return ok(LeadRead.model_validate(lead).model_dump(mode="json"))


@router.post("/{lead_id}/assign")
def assign_lead(
    lead_id: str,
    payload: LeadAssignRequest,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    if actor.role not in {"SUPER_ADMIN", "SALES_MANAGER"}:
        raise fail(403, "FORBIDDEN", "리드 배정은 관리자 또는 팀장만 수행할 수 있습니다.")
    lead = _get_lead_or_404(db, lead_id)
    before = {"owner_id": lead.owner_id}
    lead.owner_id = payload.owner_id
    lead.status = "ASSIGNED"
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="ASSIGN",
        resource_type="Lead",
        resource_id=lead.id,
        before_value=before,
        after_value={"owner_id": lead.owner_id},
    )
    db.commit()
    db.refresh(lead)
    return ok(LeadRead.model_validate(lead).model_dump(mode="json"))


@router.post("/{lead_id}/recalculate-score")
def recalculate_score(
    lead_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    lead = _get_lead_or_404(db, lead_id)
    if not actor.can_access_owner(lead.owner_id):
        raise fail(403, "FORBIDDEN", "리드 접근 권한이 없습니다.")
    before = {"lead_score": lead.lead_score, "lead_grade": lead.lead_grade}
    _score_lead(lead)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="RECALCULATE_SCORE",
        resource_type="Lead",
        resource_id=lead.id,
        before_value=before,
        after_value={"lead_score": lead.lead_score, "lead_grade": lead.lead_grade},
    )
    db.commit()
    db.refresh(lead)
    return ok(LeadRead.model_validate(lead).model_dump(mode="json"))


@router.post("/{lead_id}/convert")
def convert(
    lead_id: str,
    payload: LeadConvertRequest,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    lead = _get_lead_or_404(db, lead_id)
    if not actor.can_access_owner(lead.owner_id):
        raise fail(403, "FORBIDDEN", "리드 전환 권한이 없습니다.")
    account, contact, opportunity = convert_lead(
        db,
        lead,
        opportunity_name=payload.opportunity_name,
        amount=Decimal(payload.amount),
        owner_id=actor.user_id,
    )
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="CONVERT",
        resource_type="Lead",
        resource_id=lead.id,
        after_value={
            "account_id": account.id,
            "contact_id": contact.id,
            "opportunity_id": opportunity.id,
        },
    )
    db.commit()
    return ok(
        {
            "lead_id": lead.id,
            "account_id": account.id,
            "contact_id": contact.id,
            "opportunity_id": opportunity.id,
        }
    )
