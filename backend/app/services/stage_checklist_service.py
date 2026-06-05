from __future__ import annotations

from dataclasses import dataclass

from app.models import Opportunity


@dataclass(frozen=True)
class StageChecklistDefinition:
    key: str
    title: str
    description: str


STAGE_PROGRESS_ORDER = ["LEAD", "QUALIFIED", "PROPOSAL", "NEGOTIATION", "CLOSED_WON"]


def _item(key: str, title: str, description: str) -> StageChecklistDefinition:
    return StageChecklistDefinition(key, title, description)


STAGE_CHECKLISTS: dict[str, list[StageChecklistDefinition]] = {
    "LEAD": [
        _item("activity_logged", "초기 활동 등록", "해당 리드/기회에 대한 첫 활동을 기록합니다."),
        _item(
            "lead_profile_confirmed",
            "기본 정보 확인",
            "고객사, 담당자, 연락처 정보가 확인되었습니다.",
        ),
        _item("needs_identified", "초기 니즈 파악", "고객의 주요 과제와 기대효과를 확인했습니다."),
    ],
    "QUALIFIED": [
        _item(
            "activity_logged",
            "검증 활동 등록",
            "Qualified 단계에서 검증 활동이 기록되었습니다.",
        ),
        _item("budget_confirmed", "예산 확인", "예산 범위 또는 구매 가능성이 확인되었습니다."),
        _item(
            "authority_confirmed",
            "의사결정자 확인",
            "의사결정권자 또는 승인 라인을 확인했습니다.",
        ),
        _item("timeline_confirmed", "도입 일정 확인", "도입 목표 일정과 우선순위를 확인했습니다."),
    ],
    "PROPOSAL": [
        _item("activity_logged", "제안 활동 등록", "제안 단계 관련 활동이 기록되었습니다."),
        _item(
            "solution_scoped",
            "제안 범위 확정",
            "제안 범위와 대상 제품/서비스가 정리되었습니다.",
        ),
        _item("proposal_shared", "제안서 전달", "제안서 또는 견적서가 전달되었습니다."),
        _item(
            "review_meeting_done",
            "제안 리뷰 완료",
            "제안 리뷰 미팅 또는 피드백 수집이 완료되었습니다.",
        ),
    ],
    "NEGOTIATION": [
        _item("activity_logged", "협상 활동 등록", "협상 단계 활동이 기록되었습니다."),
        _item(
            "commercial_terms_aligned",
            "조건 협의",
            "가격, 범위, 계약 조건 협의가 진행되었습니다.",
        ),
        _item(
            "approver_path_confirmed",
            "최종 승인 경로 확인",
            "고객 내부 결재/승인 경로를 확인했습니다.",
        ),
        _item(
            "closing_plan_confirmed",
            "종결 계획 확정",
            "계약 일정 또는 최종 의사결정 일정을 확정했습니다.",
        ),
    ],
}


def checklist_stage_order(stage: str) -> int:
    try:
        return STAGE_PROGRESS_ORDER.index(stage)
    except ValueError:
        return -1


def next_stage_for(stage: str) -> str | None:
    current_index = checklist_stage_order(stage)
    if current_index < 0 or current_index + 1 >= len(STAGE_PROGRESS_ORDER):
        return None
    return STAGE_PROGRESS_ORDER[current_index + 1]


def checklist_items_for(stage: str) -> list[StageChecklistDefinition]:
    return STAGE_CHECKLISTS.get(stage, [])


def has_stage_checklist(stage: str) -> bool:
    return len(checklist_items_for(stage)) > 0


def ensure_stage_checklist_state(
    opportunity: Opportunity, *, stage: str | None = None
) -> dict[str, dict[str, bool]]:
    target_stage = stage or opportunity.stage
    state = dict(opportunity.stage_checklist_state or {})
    if not has_stage_checklist(target_stage):
        opportunity.stage_checklist_state = state
        return state

    stage_state = dict(state.get(target_stage) or {})
    for item in checklist_items_for(target_stage):
        stage_state.setdefault(item.key, False)
    state[target_stage] = stage_state
    opportunity.stage_checklist_state = state
    return state


def set_stage_checklist_item(
    opportunity: Opportunity,
    *,
    stage: str,
    item_key: str,
    checked: bool,
) -> dict[str, dict[str, bool]]:
    state = ensure_stage_checklist_state(opportunity, stage=stage)
    if item_key not in {item.key for item in checklist_items_for(stage)}:
        raise ValueError("유효하지 않은 체크리스트 항목입니다.")
    stage_state = dict(state.get(stage) or {})
    stage_state[item_key] = checked
    state[stage] = stage_state
    opportunity.stage_checklist_state = state
    return state


def mark_stage_activity_logged(opportunity: Opportunity) -> dict[str, dict[str, bool]]:
    if not has_stage_checklist(opportunity.stage):
        return dict(opportunity.stage_checklist_state or {})
    return set_stage_checklist_item(
        opportunity,
        stage=opportunity.stage,
        item_key="activity_logged",
        checked=True,
    )


def checklist_completed(opportunity: Opportunity, stage: str) -> bool:
    if not has_stage_checklist(stage):
        return False
    state = ensure_stage_checklist_state(opportunity, stage=stage)
    stage_state = state.get(stage) or {}
    return all(bool(stage_state.get(item.key, False)) for item in checklist_items_for(stage))


def serialize_stage_checklist(
    opportunity: Opportunity,
    *,
    has_related_activity: bool,
) -> dict[str, object]:
    stage = opportunity.stage
    state = ensure_stage_checklist_state(opportunity, stage=stage)
    items = [
        {
            "key": item.key,
            "title": item.title,
            "description": item.description,
            "checked": bool((state.get(stage) or {}).get(item.key, False)),
        }
        for item in checklist_items_for(stage)
    ]
    return {
        "stage": stage,
        "stage_label": stage.replace("_", " ").title(),
        "enabled": has_related_activity and len(items) > 0,
        "has_related_activity": has_related_activity,
        "auto_advance_to": next_stage_for(stage),
        "items": items,
    }
