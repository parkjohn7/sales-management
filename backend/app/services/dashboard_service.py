from datetime import date
from decimal import ROUND_HALF_UP, Decimal

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


def _percent(numerator: int, denominator: int) -> int:
    if denominator <= 0:
        return 0
    return int(
        (
            Decimal(numerator) * Decimal("100") / Decimal(denominator)
        ).quantize(Decimal("1"), rounding=ROUND_HALF_UP)
    )


def build_report_summary(db: Session) -> dict[str, object]:
    today = date.today()
    month_start = today.replace(day=1)

    leads = db.query(Lead).all()
    opportunities = db.query(Opportunity).all()
    activities = (
        db.query(Activity)
        .filter(Activity.opportunity_id.is_not(None))
        .order_by(Activity.activity_date.desc())
        .all()
    )

    monthly_new_leads = sum(
        1
        for lead in leads
        if lead.created_at.astimezone().date() >= month_start
    )
    converted_leads = sum(1 for lead in leads if lead.status == "CONVERTED")
    conversion_rate = _percent(converted_leads, len(leads))

    avg_opportunity_amount = Decimal("0")
    if opportunities:
        total_amount = sum((Decimal(str(item.amount)) for item in opportunities), Decimal("0"))
        avg_opportunity_amount = (total_amount / Decimal(len(opportunities))).quantize(
            Decimal("0.01"), rounding=ROUND_HALF_UP
        )

    closed_won_count = sum(1 for item in opportunities if item.stage == "CLOSED_WON")
    closed_lost_count = sum(1 for item in opportunities if item.stage == "CLOSED_LOST")
    won_rate = _percent(closed_won_count, closed_won_count + closed_lost_count)

    active_opportunities = [
        item for item in opportunities if item.stage not in {"CLOSED_WON", "CLOSED_LOST"}
    ]
    overdue_opportunity_count = sum(
        1
        for item in active_opportunities
        if item.expected_close_date is not None and item.expected_close_date < today
    )

    latest_activity_by_opportunity: dict[str, Activity] = {}
    for activity in activities:
        if (
            activity.opportunity_id
            and activity.opportunity_id not in latest_activity_by_opportunity
        ):
            latest_activity_by_opportunity[activity.opportunity_id] = activity

    follow_up_needed_count = 0
    for item in active_opportunities:
        latest_activity = latest_activity_by_opportunity.get(item.id)
        if latest_activity is None:
            follow_up_needed_count += 1
            continue
        if not any(
            [
                latest_activity.next_activity_type,
                latest_activity.next_activity_due_date,
                latest_activity.next_activity_memo,
            ]
        ):
            follow_up_needed_count += 1

    return {
        "monthly_new_leads": monthly_new_leads,
        "conversion_rate": conversion_rate,
        "avg_opportunity_amount": avg_opportunity_amount,
        "won_rate": won_rate,
        "overdue_opportunity_count": overdue_opportunity_count,
        "follow_up_needed_count": follow_up_needed_count,
    }
