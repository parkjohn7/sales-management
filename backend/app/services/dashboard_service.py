from decimal import Decimal

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.models import Activity, Lead, Opportunity
from app.services.forecast_service import STAGE_PROBABILITY


def build_pipeline_summary(db: Session) -> list[dict[str, object]]:
    rows = (
        db.query(
            Opportunity.stage,
            func.count(Opportunity.id),
            func.coalesce(func.sum(Opportunity.amount), 0),
        )
        .group_by(Opportunity.stage)
        .all()
    )
    counts_by_stage = {row[0]: {"count": row[1], "amount": Decimal(str(row[2]))} for row in rows}
    return [
        {
            "stage": stage,
            "probability": probability,
            "count": counts_by_stage.get(stage, {}).get("count", 0),
            "amount": counts_by_stage.get(stage, {}).get("amount", Decimal("0")),
        }
        for stage, probability in STAGE_PROBABILITY.items()
    ]


def build_dashboard_kpis(db: Session) -> dict[str, object]:
    new_leads = db.query(func.count(Lead.id)).filter(Lead.status == "NEW").scalar() or 0
    hot_leads = db.query(func.count(Lead.id)).filter(Lead.lead_grade == "HOT").scalar() or 0
    forecast = db.query(func.coalesce(func.sum(Opportunity.forecast_amount), 0)).scalar() or 0
    closed_won = (
        db.query(func.coalesce(func.sum(Opportunity.amount), 0))
        .filter(Opportunity.stage == "CLOSED_WON")
        .scalar()
        or 0
    )
    activity_count = db.query(func.count(Activity.id)).scalar() or 0
    return {
        "new_leads": new_leads,
        "hot_leads": hot_leads,
        "forecast_amount": Decimal(str(forecast)),
        "closed_won_amount": Decimal(str(closed_won)),
        "activity_count": activity_count,
    }
