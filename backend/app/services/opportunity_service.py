from datetime import date

from app.models import Opportunity, StageHistory
from app.services.forecast_service import (
    calculate_forecast_amount,
    get_stage_probability,
    normalize_stage,
)


def apply_stage_change(
    opportunity: Opportunity,
    *,
    new_stage: str,
    changed_by: str | None,
    reason: str | None = None,
    closed_date: date | None = None,
    lost_reason: str | None = None,
) -> StageHistory:
    normalized_stage = normalize_stage(new_stage)
    if normalized_stage == "CLOSED_LOST" and not lost_reason:
        raise ValueError("Closed Lost 단계 변경에는 실패 사유가 필요합니다.")

    previous_stage = opportunity.stage
    previous_probability = opportunity.probability
    new_probability = get_stage_probability(normalized_stage)

    opportunity.stage = normalized_stage
    opportunity.probability = new_probability
    opportunity.forecast_amount = calculate_forecast_amount(opportunity.amount, new_probability)

    if normalized_stage in {"CLOSED_WON", "CLOSED_LOST"}:
        opportunity.closed_date = closed_date or date.today()
    if normalized_stage == "CLOSED_LOST":
        opportunity.lost_reason = lost_reason

    return StageHistory(
        opportunity_id=opportunity.id,
        previous_stage=previous_stage,
        new_stage=normalized_stage,
        previous_probability=previous_probability,
        new_probability=new_probability,
        changed_by=changed_by,
        reason=reason,
    )


def refresh_forecast(opportunity: Opportunity) -> None:
    opportunity.probability = get_stage_probability(opportunity.stage)
    opportunity.forecast_amount = calculate_forecast_amount(
        opportunity.amount, opportunity.probability
    )
