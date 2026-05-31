from fastapi import APIRouter, Depends, Header
from sqlalchemy.orm import Session

from app.api.responses import fail, ok
from app.core.config import get_settings
from app.db.session import get_db
from app.models import Lead
from app.schemas import LeadCreate, LeadRead
from app.services.audit_service import record_audit_log
from app.services.lead_scoring_service import LeadScoringInput, score_and_grade

router = APIRouter()


def _verify_api_key(x_api_key: str | None = Header(default=None)) -> None:
    if x_api_key != get_settings().integration_api_key:
        raise fail(401, "INVALID_INTEGRATION_KEY", "연동 API Key가 올바르지 않습니다.")


def _create_integration_lead(db: Session, payload: LeadCreate) -> Lead:
    lead = Lead(**payload.model_dump())
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
    if lead.raw_payload is None:
        lead.raw_payload = payload.model_dump(mode="json")
    db.add(lead)
    db.flush()
    record_audit_log(
        db,
        actor_id="integration",
        action="CREATE",
        resource_type="Lead",
        resource_id=lead.id,
        after_value=LeadRead.model_validate(lead).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(lead)
    return lead


@router.get("/health")
def integration_health() -> dict:
    return ok({"status": "ok"})


@router.post("/web/leads", dependencies=[Depends(_verify_api_key)])
def create_web_lead(payload: LeadCreate, db: Session = Depends(get_db)) -> dict:
    payload.source_channel = payload.source_channel or "website"
    lead = _create_integration_lead(db, payload)
    return ok(LeadRead.model_validate(lead).model_dump(mode="json"))


@router.post("/chatbot/leads", dependencies=[Depends(_verify_api_key)])
def create_chatbot_lead(payload: LeadCreate, db: Session = Depends(get_db)) -> dict:
    payload.source_channel = payload.source_channel or "chatbot"
    lead = _create_integration_lead(db, payload)
    return ok(LeadRead.model_validate(lead).model_dump(mode="json"))
