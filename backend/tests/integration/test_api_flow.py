from collections.abc import Generator
from datetime import UTC, datetime

from app.db.base import Base
from app.db.session import get_db
from app.main import create_app
from app.models import *  # noqa: F403
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker
from sqlalchemy.pool import StaticPool

engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def override_get_db() -> Generator[Session, None, None]:
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


Base.metadata.create_all(bind=engine)
app = create_app()
app.dependency_overrides[get_db] = override_get_db
client = TestClient(app)


def auth_headers(user_id: str = "sales-1", role: str = "SALES_REP") -> dict[str, str]:
    response = client.post(
        "/api/v1/auth/dev-token",
        json={
            "user_id": user_id,
            "email": f"{user_id}@example.com",
            "name": user_id,
            "role": role,
        },
    )
    assert response.status_code == 200
    token = response.json()["data"]["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health_endpoint_is_public() -> None:
    response = client.get("/api/v1/health")

    assert response.status_code == 200
    assert response.json()["data"]["status"] == "ok"


def test_lead_to_opportunity_flow_and_dashboard() -> None:
    headers = auth_headers()
    lead_response = client.post(
        "/api/v1/leads",
        headers=headers,
        json={
            "company_name": "체리랩",
            "contact_name": "김매니저",
            "email": "kim@example.com",
            "phone": "010-1234-5678",
            "title": "사업기획팀장",
            "lead_source": "Web",
            "rating": "Hot",
            "annual_revenue": "1200000000",
            "employee_count": 120,
            "campaign_name": "2026 상반기 캠페인",
            "source_channel": "website",
            "budget_confirmed": True,
            "authority_confirmed": True,
            "timeline_within_3_months": True,
            "price_page_visit_count": 3,
            "downloaded_material": True,
        },
    )
    assert lead_response.status_code == 200
    lead = lead_response.json()["data"]
    assert lead["lead_score"] == 100
    assert lead["lead_grade"] == "HOT"

    convert_response = client.post(
        f"/api/v1/leads/{lead['id']}/convert",
        headers=headers,
        json={"opportunity_name": "체리랩 도입", "amount": "10000000"},
    )
    assert convert_response.status_code == 200
    opportunity_id = convert_response.json()["data"]["opportunity_id"]
    account_id = convert_response.json()["data"]["account_id"]
    contact_id = convert_response.json()["data"]["contact_id"]

    account_response = client.get(f"/api/v1/accounts/{account_id}", headers=headers)
    assert account_response.status_code == 200
    assert account_response.json()["data"]["account_type"] == "Prospect"
    assert account_response.json()["data"]["employee_count"] == 120

    contact_response = client.get(f"/api/v1/contacts/{contact_id}", headers=headers)
    assert contact_response.status_code == 200
    assert contact_response.json()["data"]["title"] == "사업기획팀장"
    assert contact_response.json()["data"]["mobile_phone"] == "010-1234-5678"

    stage_response = client.post(
        f"/api/v1/opportunities/{opportunity_id}/stage",
        headers=headers,
        json={"stage": "PROPOSAL", "reason": "제안서 송부"},
    )
    assert stage_response.status_code == 200
    opportunity = stage_response.json()["data"]
    assert opportunity["stage"] == "PROPOSAL"
    assert opportunity["probability"] == 50
    assert opportunity["forecast_amount"] == "5000000.00"
    assert opportunity["opportunity_type"] == "New Business"
    assert opportunity["primary_campaign_source"] == "2026 상반기 캠페인"

    activity_response = client.post(
        "/api/v1/activities",
        headers=headers,
        json={
            "opportunity_id": opportunity_id,
            "activity_type": "MEETING",
            "activity_date": datetime(2026, 5, 31, tzinfo=UTC).isoformat(),
            "description": "도입 미팅",
        },
    )
    assert activity_response.status_code == 200

    dashboard_response = client.get("/api/v1/dashboard/overview", headers=headers)
    assert dashboard_response.status_code == 200
    assert dashboard_response.json()["data"]["kpis"]["hot_leads"] >= 1


def test_sales_rep_cannot_read_other_owner_lead() -> None:
    manager_headers = auth_headers(user_id="manager-1", role="SALES_MANAGER")
    create_response = client.post(
        "/api/v1/leads",
        headers=manager_headers,
        json={
            "company_name": "다른회사",
            "contact_name": "박담당",
            "owner_id": "sales-other",
        },
    )
    assert create_response.status_code == 200
    lead_id = create_response.json()["data"]["id"]

    rep_headers = auth_headers(user_id="sales-1", role="SALES_REP")
    read_response = client.get(f"/api/v1/leads/{lead_id}", headers=rep_headers)

    assert read_response.status_code == 403
    assert read_response.json()["error"]["code"] == "FORBIDDEN"


def test_closed_lost_api_requires_lost_reason() -> None:
    headers = auth_headers(user_id="sales-closed-lost")
    account_response = client.post("/api/v1/accounts", headers=headers, json={"name": "로스트회사"})
    assert account_response.status_code == 200
    account_id = account_response.json()["data"]["id"]

    opportunity_response = client.post(
        "/api/v1/opportunities",
        headers=headers,
        json={"account_id": account_id, "name": "실패 검증", "amount": "1000"},
    )
    assert opportunity_response.status_code == 200
    opportunity_id = opportunity_response.json()["data"]["id"]

    response = client.post(
        f"/api/v1/opportunities/{opportunity_id}/stage",
        headers=headers,
        json={"stage": "CLOSED_LOST"},
    )

    assert response.status_code == 422
    assert response.json()["error"]["code"] == "INVALID_STAGE_CHANGE"


def test_opportunity_patch_updates_stage_with_reason() -> None:
    headers = auth_headers(user_id="sales-stage-patch")
    account_response = client.post("/api/v1/accounts", headers=headers, json={"name": "단계변경고객"})
    assert account_response.status_code == 200
    account_id = account_response.json()["data"]["id"]

    opportunity_response = client.post(
        "/api/v1/opportunities",
        headers=headers,
        json={"account_id": account_id, "name": "단계수정테스트", "amount": "1500000"},
    )
    assert opportunity_response.status_code == 200
    opportunity_id = opportunity_response.json()["data"]["id"]

    lost_update_response = client.patch(
        f"/api/v1/opportunities/{opportunity_id}",
        headers=headers,
        json={"stage": "CLOSED_LOST", "reason": "예산 축소", "lost_reason": "예산 축소"},
    )
    assert lost_update_response.status_code == 200
    assert lost_update_response.json()["data"]["stage"] == "CLOSED_LOST"
    assert lost_update_response.json()["data"]["lost_reason"] == "예산 축소"

    won_update_response = client.patch(
        f"/api/v1/opportunities/{opportunity_id}",
        headers=headers,
        json={"stage": "CLOSED_WON", "reason": "최종 계약 완료"},
    )
    assert won_update_response.status_code == 200
    assert won_update_response.json()["data"]["stage"] == "CLOSED_WON"


def test_contact_crud_flow() -> None:
    headers = auth_headers(user_id="contact-admin", role="ADMIN")
    account_response = client.post("/api/v1/accounts", headers=headers, json={"name": "연락처고객"})
    assert account_response.status_code == 200
    account_id = account_response.json()["data"]["id"]

    create_response = client.post(
        "/api/v1/contacts",
        headers=headers,
        json={
            "account_id": account_id,
            "name": "이의사결정권자",
            "email": "buyer@example.com",
            "mobile_phone": "010-3333-4444",
            "department": "구매팀",
            "role_type": "DECISION_MAKER",
        },
    )
    assert create_response.status_code == 200
    contact_id = create_response.json()["data"]["id"]

    read_response = client.get(f"/api/v1/contacts/{contact_id}", headers=headers)
    assert read_response.status_code == 200
    assert read_response.json()["data"]["name"] == "이의사결정권자"
    assert read_response.json()["data"]["department"] == "구매팀"

    update_response = client.patch(
        f"/api/v1/contacts/{contact_id}",
        headers=headers,
        json={"title": "구매팀장", "phone": "010-1111-2222"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["title"] == "구매팀장"

    delete_response = client.delete(f"/api/v1/contacts/{contact_id}", headers=headers)
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["deleted"] is True


def test_activity_crud_flow() -> None:
    headers = auth_headers(user_id="activity-owner")

    create_response = client.post(
        "/api/v1/activities",
        headers=headers,
        json={
            "activity_type": "CALL",
            "activity_date": datetime(2026, 5, 31, 9, 30, tzinfo=UTC).isoformat(),
            "due_date": "2026-06-03",
            "status": "OPEN",
            "priority": "HIGH",
            "description": "초기 통화",
            "next_activity_type": "MEETING",
            "next_activity_memo": "다음 방문 미팅 준비",
        },
    )
    assert create_response.status_code == 200
    activity_id = create_response.json()["data"]["id"]

    read_response = client.get(f"/api/v1/activities/{activity_id}", headers=headers)
    assert read_response.status_code == 200
    assert read_response.json()["data"]["activity_type"] == "CALL"
    assert read_response.json()["data"]["next_activity_memo"] == "다음 방문 미팅 준비"
    assert read_response.json()["data"]["priority"] == "HIGH"

    update_response = client.patch(
        f"/api/v1/activities/{activity_id}",
        headers=headers,
        json={"activity_type": "MEETING", "description": "방문 미팅", "status": "DONE"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["activity_type"] == "MEETING"
    assert update_response.json()["data"]["status"] == "DONE"

    delete_response = client.delete(f"/api/v1/activities/{activity_id}", headers=headers)
    assert delete_response.status_code == 200
    assert delete_response.json()["data"]["deleted"] is True


def test_account_delete_requires_no_related_records() -> None:
    headers = auth_headers(user_id="account-admin", role="ADMIN")
    account_response = client.post("/api/v1/accounts", headers=headers, json={"name": "삭제검증"})
    assert account_response.status_code == 200
    account_id = account_response.json()["data"]["id"]

    blocked_response = client.post(
        "/api/v1/contacts",
        headers=headers,
        json={"account_id": account_id, "name": "관계자"},
    )
    assert blocked_response.status_code == 200

    delete_response = client.delete(f"/api/v1/accounts/{account_id}", headers=headers)
    assert delete_response.status_code == 409
    assert delete_response.json()["error"]["code"] == "ACCOUNT_HAS_RELATIONS"


def test_admin_settings_requires_super_admin_for_updates() -> None:
    rep_headers = auth_headers(user_id="settings-rep", role="SALES_REP")
    blocked_response = client.put(
        "/api/v1/admin/settings",
        headers=rep_headers,
        json={
            "stage_probabilities": {"LEAD": 15},
            "lead_scoring_policy": {},
            "integration_policy": {},
        },
    )
    assert blocked_response.status_code == 403

    admin_headers = auth_headers(user_id="settings-admin", role="SUPER_ADMIN")
    update_response = client.put(
        "/api/v1/admin/settings",
        headers=admin_headers,
        json={
            "stage_probabilities": {
                "LEAD": 10,
                "QUALIFIED": 30,
                "PROPOSAL": 50,
                "NEGOTIATION": 75,
                "CLOSED_WON": 100,
                "CLOSED_LOST": 0,
            },
            "lead_scoring_policy": {"budget_confirmed": 25},
            "integration_policy": {"website_enabled": True, "chatbot_enabled": True},
        },
    )
    assert update_response.status_code == 200
    assert update_response.json()["data"]["stage_probabilities"]["QUALIFIED"] == 30


def test_integration_lead_intake_requires_key_and_reports_channels() -> None:
    invalid_response = client.post(
        "/api/v1/integrations/web/leads",
        json={"company_name": "무효연동", "contact_name": "키없음"},
    )
    assert invalid_response.status_code == 401

    response = client.post(
        "/api/v1/integrations/web/leads",
        headers={"X-API-Key": "local-integration-key"},
        json={
            "company_name": "웹인입회사",
            "contact_name": "정문의",
            "source_channel": "website",
            "budget_confirmed": True,
            "raw_payload": {"utm_source": "homepage"},
        },
    )
    assert response.status_code == 200
    assert response.json()["data"]["source_channel"] == "website"

    reports_response = client.get(
        "/api/v1/dashboard/reports",
        headers=auth_headers(user_id="report-admin", role="SUPER_ADMIN"),
    )
    assert reports_response.status_code == 200
    assert reports_response.json()["data"]["integration"]["website_leads"] >= 1
