from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor
from app.api.responses import ok
from app.db.session import get_db
from app.models import Activity, Lead, Opportunity
from app.services.dashboard_service import (
    build_dashboard_kpis,
    build_pipeline_summary,
    build_report_summary,
)

router = APIRouter()


@router.get("/pipeline-summary")
def pipeline_summary(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    return ok(build_pipeline_summary(db))


@router.get("/forecast")
def forecast(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    kpis = build_dashboard_kpis(db)
    return ok(
        {
            "forecast_amount": kpis["forecast_amount"],
            "closed_won_amount": kpis["closed_won_amount"],
        }
    )


@router.get("/funnel")
def funnel(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    lead_count = db.query(Lead).count()
    pipeline = build_pipeline_summary(db)
    return ok([{"stage": "LEAD_INBOX", "count": lead_count}, *pipeline])


@router.get("/channel-performance")
def channel_performance(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    channels: dict[str, dict[str, int]] = {}
    for lead in db.query(Lead).all():
        channels.setdefault(lead.source_channel, {"lead_count": 0, "hot_lead_count": 0})
        channels[lead.source_channel]["lead_count"] += 1
        if lead.lead_grade == "HOT":
            channels[lead.source_channel]["hot_lead_count"] += 1
    return ok([{"source_channel": channel, **values} for channel, values in channels.items()])


@router.get("/activity-performance")
def activity_performance(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    kpis = build_dashboard_kpis(db)
    return ok({"activity_count": kpis["activity_count"]})


@router.get("/reports")
def reports(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    channel_rows = db.query(Lead.source_channel, Lead.lead_grade).all()
    channels: dict[str, dict[str, int]] = {}
    for source_channel, lead_grade in channel_rows:
        channel = source_channel or "unknown"
        channels.setdefault(channel, {"lead_count": 0, "hot_lead_count": 0})
        channels[channel]["lead_count"] += 1
        if lead_grade == "HOT":
            channels[channel]["hot_lead_count"] += 1

    activity_rows = db.query(Activity.owner_id, Activity.activity_type).all()
    activities_by_owner: dict[str, dict[str, int]] = {}
    for owner_id, activity_type in activity_rows:
        owner = owner_id or "unassigned"
        activities_by_owner.setdefault(owner, {"activity_count": 0})
        activities_by_owner[owner]["activity_count"] += 1
        key = f"{activity_type.lower()}_count"
        activities_by_owner[owner][key] = activities_by_owner[owner].get(key, 0) + 1

    return ok(
        {
            "channels": [
                {"source_channel": channel, **values} for channel, values in channels.items()
            ],
            "activities_by_owner": [
                {"owner_id": owner_id, **values}
                for owner_id, values in activities_by_owner.items()
            ],
            "pipeline": build_pipeline_summary(db),
            "integration": {
                "website_leads": channels.get("website", {}).get("lead_count", 0),
                "chatbot_leads": channels.get("chatbot", {}).get("lead_count", 0),
            },
            "summary": build_report_summary(db),
        }
    )


@router.get("/overview")
def overview(
    db: Session = Depends(get_db),
    _: Actor = Depends(get_current_actor),
) -> dict:
    return ok(
        {
            "kpis": build_dashboard_kpis(db),
            "pipeline": build_pipeline_summary(db),
            "opportunity_count": db.query(Opportunity).count(),
        }
    )
