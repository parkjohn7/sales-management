from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor
from app.api.responses import fail, ok
from app.db.session import get_db
from app.models import Account, Opportunity
from app.schemas import (
    OpportunityCreate,
    OpportunityRead,
    OpportunityStageChangeRequest,
    OpportunityUpdate,
)
from app.services.audit_service import record_audit_log
from app.services.forecast_service import (
    calculate_forecast_amount,
    get_stage_probability,
    normalize_stage,
)
from app.services.opportunity_service import apply_stage_change, refresh_forecast

router = APIRouter()


def _get_opportunity_or_404(db: Session, opportunity_id: str) -> Opportunity:
    opportunity = db.get(Opportunity, opportunity_id)
    if opportunity is None:
        raise fail(
            404,
            "OPPORTUNITY_NOT_FOUND",
            "영업기회를 찾을 수 없습니다.",
            {"opportunity_id": opportunity_id},
        )
    return opportunity


@router.get("")
def list_opportunities(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    stage: str | None = None,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    query = db.query(Opportunity)
    if actor.role == "SALES_REP":
        query = query.filter(Opportunity.owner_id == actor.user_id)
    if stage:
        query = query.filter(Opportunity.stage == normalize_stage(stage))
    total = query.count()
    opportunities = (
        query.order_by(Opportunity.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return ok(
        [
            OpportunityRead.model_validate(opportunity).model_dump(mode="json")
            for opportunity in opportunities
        ],
        {"page": page, "page_size": page_size, "total": total},
    )


@router.post("")
def create_opportunity(
    payload: OpportunityCreate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    if db.get(Account, payload.account_id) is None:
        raise fail(
            404,
            "ACCOUNT_NOT_FOUND",
            "영업기회를 연결할 고객사를 찾을 수 없습니다.",
            {"account_id": payload.account_id},
        )
    stage = normalize_stage(payload.stage)
    probability = get_stage_probability(stage)
    opportunity = Opportunity(
        **payload.model_dump(exclude={"stage", "owner_id"}),
        stage=stage,
        owner_id=payload.owner_id or actor.user_id,
        probability=probability,
        forecast_amount=calculate_forecast_amount(payload.amount, probability),
    )
    db.add(opportunity)
    db.flush()
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="CREATE",
        resource_type="Opportunity",
        resource_id=opportunity.id,
        after_value=OpportunityRead.model_validate(opportunity).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(opportunity)
    return ok(OpportunityRead.model_validate(opportunity).model_dump(mode="json"))


@router.get("/{opportunity_id}")
def get_opportunity(
    opportunity_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    opportunity = _get_opportunity_or_404(db, opportunity_id)
    if not actor.can_access_owner(opportunity.owner_id):
        raise fail(403, "FORBIDDEN", "영업기회 접근 권한이 없습니다.")
    return ok(OpportunityRead.model_validate(opportunity).model_dump(mode="json"))


@router.patch("/{opportunity_id}")
def update_opportunity(
    opportunity_id: str,
    payload: OpportunityUpdate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    opportunity = _get_opportunity_or_404(db, opportunity_id)
    if not actor.can_access_owner(opportunity.owner_id):
        raise fail(403, "FORBIDDEN", "영업기회 수정 권한이 없습니다.")
    before = OpportunityRead.model_validate(opportunity).model_dump(mode="json")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(opportunity, field, value)
    if payload.amount is not None:
        refresh_forecast(opportunity)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="UPDATE",
        resource_type="Opportunity",
        resource_id=opportunity.id,
        before_value=before,
        after_value=OpportunityRead.model_validate(opportunity).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(opportunity)
    return ok(OpportunityRead.model_validate(opportunity).model_dump(mode="json"))


@router.post("/{opportunity_id}/stage")
def change_stage(
    opportunity_id: str,
    payload: OpportunityStageChangeRequest,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    opportunity = _get_opportunity_or_404(db, opportunity_id)
    if not actor.can_access_owner(opportunity.owner_id):
        raise fail(403, "FORBIDDEN", "영업기회 단계 변경 권한이 없습니다.")
    before = OpportunityRead.model_validate(opportunity).model_dump(mode="json")
    try:
        history = apply_stage_change(
            opportunity,
            new_stage=payload.stage,
            changed_by=actor.user_id,
            reason=payload.reason,
            closed_date=payload.closed_date,
            lost_reason=payload.lost_reason,
        )
    except ValueError as exc:
        raise fail(422, "INVALID_STAGE_CHANGE", str(exc)) from exc
    db.add(history)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="CHANGE_STAGE",
        resource_type="Opportunity",
        resource_id=opportunity.id,
        before_value=before,
        after_value=OpportunityRead.model_validate(opportunity).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(opportunity)
    return ok(OpportunityRead.model_validate(opportunity).model_dump(mode="json"))


@router.post("/{opportunity_id}/close-won")
def close_won(
    opportunity_id: str,
    payload: OpportunityStageChangeRequest,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    payload.stage = "CLOSED_WON"
    return change_stage(opportunity_id, payload, db, actor)


@router.post("/{opportunity_id}/close-lost")
def close_lost(
    opportunity_id: str,
    payload: OpportunityStageChangeRequest,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    payload.stage = "CLOSED_LOST"
    return change_stage(opportunity_id, payload, db, actor)
