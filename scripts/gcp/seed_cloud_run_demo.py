from __future__ import annotations

import json
import os
from datetime import datetime, timezone
from decimal import Decimal
from typing import Any
from urllib import error, parse, request

API_BASE_URL = os.environ.get(
    "BACKEND_API_BASE_URL",
    "https://sales-management-backend-nrkjvfgjra-du.a.run.app/api/v1",
).rstrip("/")

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


def api_request(
    path: str,
    *,
    method: str = "GET",
    token: str | None = None,
    payload: dict[str, Any] | None = None,
    query: dict[str, Any] | None = None,
) -> dict[str, Any]:
    url = f"{API_BASE_URL}{path}"
    if query:
        url = f"{url}?{parse.urlencode(query)}"
    data = None
    headers = {"Content-Type": "application/json"}
    if token:
        headers["Authorization"] = f"Bearer {token}"
    if payload is not None:
        data = json.dumps(payload).encode("utf-8")
    req = request.Request(url, method=method, headers=headers, data=data)
    try:
        with request.urlopen(req) as resp:
            return json.loads(resp.read().decode("utf-8"))
    except error.HTTPError as exc:  # pragma: no cover - operational path
        body = exc.read().decode("utf-8", errors="replace")
        raise RuntimeError(f"{method} {url} failed: {exc.code} {body}") from exc


def issue_dev_token() -> str:
    response = api_request(
        "/auth/dev-token",
        method="POST",
        payload={
            "user_id": "server-demo-seed",
            "email": "sales@cherrylab.com",
            "name": "server-demo-seed",
            "role": "SUPER_ADMIN",
        },
    )
    return response["data"]["access_token"]


def iso_datetime(index: int) -> str:
    return datetime(2026, 6, min(index, 9), 10, 0, tzinfo=timezone.utc).isoformat()


def upsert_demo_rows() -> None:
    token = issue_dev_token()
    existing_leads = api_request("/leads", token=token, query={"page_size": 100})["data"]
    existing_opportunities = api_request("/opportunities", token=token, query={"page_size": 100})[
        "data"
    ]
    existing_activities = api_request("/activities", token=token, query={"page_size": 100})["data"]

    for index, demo in enumerate(DEMO_LEADS, start=1):
        opportunity = next(
            (
                item
                for item in existing_opportunities
                if item["name"] == demo["opportunity_name"]
                and item.get("lead_company_name") == demo["company_name"]
            ),
            None,
        )

        if opportunity is None:
            lead = next(
                (
                    item
                    for item in existing_leads
                    if item["company_name"] == demo["company_name"]
                    and item["contact_name"] == demo["contact_name"]
                ),
                None,
            )
            if lead is None:
                lead = api_request(
                    "/leads",
                    method="POST",
                    token=token,
                    payload={
                        "company_name": demo["company_name"],
                        "contact_name": demo["contact_name"],
                        "email": demo["email"],
                        "phone": demo["phone"],
                        "title": demo["title"],
                        "lead_source": demo["lead_source"],
                        "rating": demo["rating"],
                        "annual_revenue": str(Decimal("1000000000") * index),
                        "employee_count": 50 * index,
                        "campaign_name": demo["campaign_name"],
                        "source_channel": demo["source_channel"],
                        "budget_confirmed": demo["budget_confirmed"],
                        "authority_confirmed": demo["authority_confirmed"],
                        "timeline_within_3_months": demo["timeline_within_3_months"],
                        "price_page_visit_count": demo["price_page_visit_count"],
                        "downloaded_material": demo["downloaded_material"],
                    },
                )["data"]
                existing_leads.append(lead)

            convert_response = api_request(
                f"/leads/{lead['id']}/convert",
                method="POST",
                token=token,
                payload={
                    "opportunity_name": demo["opportunity_name"],
                    "amount": str(demo["amount"]),
                },
            )["data"]

            opportunity = api_request(
                f"/opportunities/{convert_response['opportunity_id']}",
                method="GET",
                token=token,
            )["data"]
            existing_opportunities.append(opportunity)

        if opportunity["stage"] != demo["target_stage"]:
            opportunity = api_request(
                f"/opportunities/{opportunity['id']}",
                method="PATCH",
                token=token,
                payload={"stage": demo["target_stage"]},
            )["data"]

        activity_exists = any(
            item.get("opportunity_id") == opportunity["id"]
            and item.get("description") == f"{demo['target_stage']} 단계 데모 활동"
            for item in existing_activities
        )
        if not activity_exists:
            activity = api_request(
                "/activities",
                method="POST",
                token=token,
                payload={
                    "opportunity_id": opportunity["id"],
                    "activity_type": demo["activity_type"],
                    "activity_date": iso_datetime(index),
                    "description": f"{demo['target_stage']} 단계 데모 활동",
                },
            )["data"]
            existing_activities.append(activity)

        checklist = api_request(
            f"/opportunities/{opportunity['id']}/checklist",
            method="GET",
            token=token,
        )["data"]
        if checklist["enabled"]:
            checked_map = {item["key"]: item["checked"] for item in checklist["items"]}
            for item_key in demo["checked_items"]:
                if not checked_map.get(item_key):
                    api_request(
                        f"/opportunities/{opportunity['id']}/checklist",
                        method="PATCH",
                        token=token,
                        payload={"item_key": item_key, "checked": True},
                    )


if __name__ == "__main__":
    upsert_demo_rows()
    print("Cloud Run demo seed synced.")
