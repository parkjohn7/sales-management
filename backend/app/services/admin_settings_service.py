from sqlalchemy.orm import Session

from app.models import AdminSetting
from app.schemas import AdminSettingsRead, AdminSettingsUpdate
from app.services.forecast_service import STAGE_PROBABILITY

SETTINGS_KEY = "sales_management"

DEFAULT_SETTINGS = AdminSettingsUpdate(
    stage_probabilities=STAGE_PROBABILITY,
    lead_scoring_policy={
        "budget_confirmed": 25,
        "authority_confirmed": 25,
        "timeline_within_3_months": 25,
        "downloaded_material": 10,
        "price_page_visit": 5,
    },
    integration_policy={
        "website_enabled": True,
        "chatbot_enabled": True,
        "default_owner_id": "",
    },
)


def read_admin_settings(db: Session) -> AdminSettingsRead:
    row = db.get(AdminSetting, SETTINGS_KEY)
    if row is None:
        return AdminSettingsRead(**DEFAULT_SETTINGS.model_dump())
    return AdminSettingsRead(
        **{**DEFAULT_SETTINGS.model_dump(), **row.value},
        updated_by=row.updated_by,
        updated_at=row.updated_at,
    )


def save_admin_settings(
    db: Session, payload: AdminSettingsUpdate, *, updated_by: str
) -> AdminSettingsRead:
    row = db.get(AdminSetting, SETTINGS_KEY)
    base_value = row.value if row is not None else {}
    merged = {**DEFAULT_SETTINGS.model_dump(), **base_value, **payload.model_dump()}
    if row is None:
        row = AdminSetting(key=SETTINGS_KEY, value=merged, updated_by=updated_by)
        db.add(row)
    else:
        row.value = merged
        row.updated_by = updated_by
    db.commit()
    db.refresh(row)
    return AdminSettingsRead(**row.value, updated_by=row.updated_by, updated_at=row.updated_at)
