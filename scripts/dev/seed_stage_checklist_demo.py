from __future__ import annotations

import sys
from datetime import datetime, timezone
from decimal import Decimal
from pathlib import Path

ROOT_DIR = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT_DIR / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from app.db.base import Base
from app.db.session import SessionLocal, engine
from app.models import Account, Activity, Contact, Lead, Opportunity
from app.services.lead_conversion_service import convert_lead
from app.services.lead_scoring_service import LeadScoringInput, score_and_grade
from app.services.opportunity_service import apply_stage_change
from app.services.stage_checklist_service import mark_stage_activity_logged, set_stage_checklist_item


DEMO_OWNER_ID = "sales@cherrylab.com"
DEMO_LEADS = [
    {
        "company_name": "체크리스트 데모 A",
        "contact_name": "김영업",
        "email": "demo-a@cherrylab.com",
        "phone": "010-2000-0001",
        "title": "구매팀장",
        "lead_source": "Web",
        "rating": "Hot",
        "campaign_name": "체크리스트 런칭",
        "source_channel": "website",
        "budget_confirmed": True,
        "authority_confirmed": True,
        "timeline_within_3_months": False,
        "price_page_visit_count": 2,
        "downloaded_material": True,
        "opportunity_name": "체크리스트 데모 A 도입",
        "amount": Decimal("15000000"),
        "target_stage": "QUALIFIED",
        "checked_items": ["budget_confirmed"],
        "activity_type": "MEETING",
    },
    {
        "company_name": "체크리스트 데모 B",
        "contact_name": "박제안",
        "email": "demo-b@cherrylab.com",
        "phone": "010-2000-0002",
        "title": "IT팀장",
        "lead_source": "Partner",
        "rating": "Warm",
        "campaign_name": "파트너 공동세미나",
        "source_channel": "manual",
        "budget_confirmed": True,
        "authority_confirmed": True,
        "timeline_within_3_months": True,
        "price_page_visit_count": 3,
        "downloaded_material": True,
        "opportunity_name": "체크리스트 데모 B 제안",
        "amount": Decimal("28000000"),
        "target_stage": "PROPOSAL",
        "checked_items": ["solution_scoped", "proposal_shared"],
        "activity_type": "PROPOSAL_SENT",
    },
    {
        "company_name": "체크리스트 데모 C",
        "contact_name": "이협상",
        "email": "demo-c@cherrylab.com",
        "phone": "010-2000-0003",
        "title": "사업본부장",
        "lead_source": "Event",
        "rating": "Hot",
        "campaign_name": "제조 DX 포럼",
        "source_channel": "website",
        "budget_confirmed": True,
        "authority_confirmed": True,
        "timeline_within_3_months": True,
        "price_page_visit_count": 5,
        "downloaded_material": True,
        "opportunity_name": "체크리스트 데모 C 협상",
        "amount": Decimal("54000000"),
        "target_stage": "NEGOTIATION",
        "checked_items": ["commercial_terms_aligned", "approver_path_confirmed"],
        "activity_type": "FOLLOW_UP",
    },
]


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


def reset_demo_rows() -> None:
    with SessionLocal() as db:
        names = [item["company_name"] for item in DEMO_LEADS]
        lead_ids = [lead.id for lead in db.query(Lead).filter(Lead.company_name.in_(names)).all()]
        opportunity_ids = [
            opportunity.id
            for opportunity in db.query(Opportunity).filter(Opportunity.lead_id.in_(lead_ids)).all()
        ]
        account_ids = [
            account.id for account in db.query(Account).filter(Account.name.in_(names)).all()
        ]

        if opportunity_ids:
            db.query(Activity).filter(Activity.opportunity_id.in_(opportunity_ids)).delete(
                synchronize_session=False
            )
            db.query(Opportunity).filter(Opportunity.id.in_(opportunity_ids)).delete(
                synchronize_session=False
            )
        if account_ids:
            db.query(Contact).filter(Contact.account_id.in_(account_ids)).delete(
                synchronize_session=False
            )
            db.query(Account).filter(Account.id.in_(account_ids)).delete(synchronize_session=False)
        if lead_ids:
            db.query(Lead).filter(Lead.id.in_(lead_ids)).delete(synchronize_session=False)
        db.commit()


def seed_demo_rows() -> None:
    Base.metadata.create_all(bind=engine)
    reset_demo_rows()
    with SessionLocal() as db:
        for index, demo in enumerate(DEMO_LEADS, start=1):
            lead = Lead(
                company_name=str(demo["company_name"]),
                contact_name=str(demo["contact_name"]),
                email=str(demo["email"]),
                phone=str(demo["phone"]),
                title=str(demo["title"]),
                lead_source=str(demo["lead_source"]),
                rating=str(demo["rating"]),
                annual_revenue=Decimal("1000000000") * index,
                employee_count=50 * index,
                campaign_name=str(demo["campaign_name"]),
                source_channel=str(demo["source_channel"]),
                budget_confirmed=bool(demo["budget_confirmed"]),
                authority_confirmed=bool(demo["authority_confirmed"]),
                timeline_within_3_months=bool(demo["timeline_within_3_months"]),
                price_page_visit_count=int(demo["price_page_visit_count"]),
                downloaded_material=bool(demo["downloaded_material"]),
                owner_id=DEMO_OWNER_ID,
            )
            _score_lead(lead)
            db.add(lead)
            db.flush()

            _, _, opportunity = convert_lead(
                db,
                lead,
                opportunity_name=str(demo["opportunity_name"]),
                amount=Decimal(str(demo["amount"])),
                owner_id=DEMO_OWNER_ID,
            )
            db.flush()

            while opportunity.stage != demo["target_stage"]:
                history = apply_stage_change(
                    opportunity,
                    new_stage=str(demo["target_stage"])
                    if opportunity.stage == "PROPOSAL"
                    else (
                        "PROPOSAL"
                        if demo["target_stage"] in {"PROPOSAL", "NEGOTIATION"}
                        and opportunity.stage == "QUALIFIED"
                        else "NEGOTIATION"
                    ),
                    changed_by=DEMO_OWNER_ID,
                    reason="데모 데이터 단계 준비",
                )
                db.add(history)
                db.flush()

            activity = Activity(
                opportunity_id=opportunity.id,
                activity_type=str(demo["activity_type"]),
                activity_date=datetime(2026, 6, min(index, 9), 10, 0, tzinfo=timezone.utc),
                description=f"{demo['target_stage']} 단계 데모 활동",
                owner_id=DEMO_OWNER_ID,
            )
            db.add(activity)
            db.flush()
            mark_stage_activity_logged(opportunity)
            for item_key in demo["checked_items"]:
                set_stage_checklist_item(
                    opportunity,
                    stage=opportunity.stage,
                    item_key=str(item_key),
                    checked=True,
                )

        db.commit()


if __name__ == "__main__":
    seed_demo_rows()
    print("Seeded 3 demo leads, converted opportunities, and stage activities.")
