from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import Actor, get_current_actor
from app.api.responses import fail, ok
from app.db.session import get_db
from app.models import Activity
from app.schemas import ActivityCreate, ActivityRead, ActivityUpdate
from app.services.audit_service import record_audit_log

router = APIRouter()


@router.get("")
def list_activities(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    lead_id: str | None = None,
    opportunity_id: str | None = None,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    query = db.query(Activity)
    if actor.role == "SALES_REP":
        query = query.filter(Activity.owner_id == actor.user_id)
    if lead_id:
        query = query.filter(Activity.lead_id == lead_id)
    if opportunity_id:
        query = query.filter(Activity.opportunity_id == opportunity_id)
    total = query.count()
    activities = (
        query.order_by(Activity.activity_date.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
        .all()
    )
    return ok(
        [ActivityRead.model_validate(activity).model_dump(mode="json") for activity in activities],
        {"page": page, "page_size": page_size, "total": total},
    )


@router.post("")
def create_activity(
    payload: ActivityCreate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    activity = Activity(
        **payload.model_dump(exclude={"owner_id"}),
        owner_id=payload.owner_id or actor.user_id,
    )
    db.add(activity)
    db.flush()
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="CREATE",
        resource_type="Activity",
        resource_id=activity.id,
        after_value=ActivityRead.model_validate(activity).model_dump(mode="json"),
    )
    db.commit()
    db.refresh(activity)
    return ok(ActivityRead.model_validate(activity).model_dump(mode="json"))


@router.get("/{activity_id}")
def get_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    activity = db.get(Activity, activity_id)
    if activity is None:
        raise fail(
            404,
            "ACTIVITY_NOT_FOUND",
            "활동을 찾을 수 없습니다.",
            {"activity_id": activity_id},
        )
    if actor.role == "SALES_REP" and activity.owner_id != actor.user_id:
        raise fail(403, "FORBIDDEN", "본인 활동만 조회할 수 있습니다.")
    return ok(ActivityRead.model_validate(activity).model_dump(mode="json"))


@router.patch("/{activity_id}")
def update_activity(
    activity_id: str,
    payload: ActivityUpdate,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    activity = db.get(Activity, activity_id)
    if activity is None:
        raise fail(
            404,
            "ACTIVITY_NOT_FOUND",
            "활동을 찾을 수 없습니다.",
            {"activity_id": activity_id},
        )
    if actor.role == "SALES_REP" and activity.owner_id != actor.user_id:
        raise fail(403, "FORBIDDEN", "본인 활동만 수정할 수 있습니다.")

    before_value = ActivityRead.model_validate(activity).model_dump(mode="json")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(activity, field, value)
    db.flush()
    after_value = ActivityRead.model_validate(activity).model_dump(mode="json")
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="UPDATE",
        resource_type="Activity",
        resource_id=activity.id,
        before_value=before_value,
        after_value=after_value,
    )
    db.commit()
    db.refresh(activity)
    return ok(ActivityRead.model_validate(activity).model_dump(mode="json"))


@router.delete("/{activity_id}")
def delete_activity(
    activity_id: str,
    db: Session = Depends(get_db),
    actor: Actor = Depends(get_current_actor),
) -> dict:
    activity = db.get(Activity, activity_id)
    if activity is None:
        raise fail(
            404,
            "ACTIVITY_NOT_FOUND",
            "활동을 찾을 수 없습니다.",
            {"activity_id": activity_id},
        )
    if actor.role == "SALES_REP" and activity.owner_id != actor.user_id:
        raise fail(403, "FORBIDDEN", "본인 활동만 삭제할 수 있습니다.")

    before_value = ActivityRead.model_validate(activity).model_dump(mode="json")
    db.delete(activity)
    record_audit_log(
        db,
        actor_id=actor.user_id,
        action="DELETE",
        resource_type="Activity",
        resource_id=activity_id,
        before_value=before_value,
    )
    db.commit()
    return ok({"id": activity_id, "deleted": True})
