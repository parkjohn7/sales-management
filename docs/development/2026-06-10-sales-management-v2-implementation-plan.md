# Sales Management v2.0 Proactive Action Layer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 영업관리시스템을 유지하면서 AI 기반 Proactive Action Layer를 실행 단위별로 분리하고, 안전한 승인형 액션 구조를 가진 v2.0으로 확장한다.

**Architecture:** 메인 시스템은 `frontend + main-api`를 시스템 오브 레코드로 유지하고, AI 액션, 위험 시그널, 외부 연동, 인맥 추천을 worker/service 단위로 분리한다. 모든 쓰기 액션은 공통 command/approval 경로를 통해 실행하며, 외부 연동과 알림은 비동기 워커에서 수행한다.

**Tech Stack:** React, TypeScript, Tailwind CSS, FastAPI, SQLAlchemy, PostgreSQL, Alembic, Docker Compose, Slack API, Gmail API, Google Calendar API, D3.js, background scheduler/queue

---

## 1. File Structure Plan

### 신규 또는 분리 대상 디렉터리

- `backend/app/services/crm_core/`: 기존 핵심 도메인 로직 이동
- `backend/app/services/approvals/`: 승인형 액션 상태 관리
- `backend/workers/agent_worker/`: 자연어 입력, tool orchestration
- `backend/workers/risk_worker/`: 위험 시그널 계산, Slack 알림
- `backend/workers/integration_worker/`: Gmail Draft, Calendar sync
- `backend/insights/bridge_service/`: 인맥 추천/그래프 가공
- `shared/contracts/`: worker와 API 간 공통 payload 스키마
- `shared/events/`: 비동기 이벤트 스키마
- `shared/prompts/`: LLM 프롬프트와 structured output 템플릿
- `frontend/src/features/agent/`: 자연어 액션 UI
- `frontend/src/features/insights/`: Bridge Insights 및 그래프 UI

### 기존 파일 중 1차 수정 후보

- `backend/app/main.py`
- `backend/app/core/config.py`
- `backend/app/api/v1/router.py`
- `backend/app/api/v1/opportunities.py`
- `backend/app/api/v1/activities.py`
- `backend/app/api/v1/admin.py`
- `backend/app/models/entities.py`
- `backend/app/schemas/domain.py`
- `backend/app/services/opportunity_service.py`
- `backend/app/services/audit_service.py`
- `backend/app/services/admin_settings_service.py`
- `frontend/src/features/Dashboard.tsx`
- `frontend/src/api/client.ts`
- `frontend/src/api/types.ts`
- `docker-compose.yml`
- `docs/architecture/overview.md`
- `docs/architecture/data-model.md`
- `docs/architecture/api-contract.md`

## 2. Workstream Plan

### Task 1: Planner Agent - v2.0 spec and architecture contract

**Files:**
- Create: `docs/specs/v2-0001-sales-management-v2-proactive-action-layer.md`
- Create: `docs/development/2026-06-10-sales-management-v2-implementation-plan.md`
- Modify: `docs/architecture/overview.md`
- Modify: `docs/architecture/workstream-map.md`

- [ ] 문서에 v2.0 목표, 비목표, 기능/기술 요구사항, 실행 단위 분리 원칙을 정리한다.
- [ ] 기존 v1 영업관리시스템과 v2.0 Proactive Action Layer의 경계를 명시한다.
- [ ] 에이전트별 책임과 머지 순서를 v2 기준으로 갱신한다.
- [ ] 계획 문서를 리뷰하고 용어 충돌을 제거한다.

### Task 2: Backend Foundation Agent - runtime split skeleton

**Files:**
- Create: `backend/workers/agent_worker/__init__.py`
- Create: `backend/workers/risk_worker/__init__.py`
- Create: `backend/workers/integration_worker/__init__.py`
- Create: `backend/insights/bridge_service/__init__.py`
- Create: `shared/contracts/__init__.py`
- Create: `shared/events/__init__.py`
- Modify: `backend/app/core/config.py`
- Modify: `docker-compose.yml`

- [ ] worker/service 실행 단위용 디렉터리와 설정 모델을 추가한다.
- [ ] worker 공통 환경 변수와 비밀 값 범위를 분리한다.
- [ ] docker-compose에 main-api와 worker 실행 예시를 추가한다.
- [ ] health/ready 기준을 main-api와 worker로 나눌 준비를 한다.

### Task 3: Domain Agent - approval action model and data model delta

**Files:**
- Modify: `backend/app/models/entities.py`
- Modify: `docs/architecture/data-model.md`
- Create: `backend/alembic/versions/<revision>_add_agent_action_tables.py`
- Create: `backend/tests/unit/test_agent_action_models.py`

- [ ] `agent_action_requests`, `stage_recommendations`, `risk_signals` 등 핵심 신규 테이블을 설계한다.
- [ ] Opportunity와 Activity의 v2 관련 필드 확장 범위를 확정한다.
- [ ] 마이그레이션과 롤백 노트를 작성한다.
- [ ] 모델 제약과 기본 인덱스를 테스트한다.

### Task 4: API Agent - approval and recommendation API

**Files:**
- Create: `backend/app/api/v1/agent_actions.py`
- Create: `backend/app/api/v1/recommendations.py`
- Modify: `backend/app/api/v1/router.py`
- Modify: `backend/app/schemas/domain.py`
- Modify: `docs/architecture/api-contract.md`
- Create: `backend/tests/integration/test_agent_actions_api.py`

- [ ] AI 제안 생성, 승인, 거절, 실행 결과 조회 API를 정의한다.
- [ ] stage recommendation 조회/승인 API를 정의한다.
- [ ] 공통 응답 형식과 권한 체크를 연결한다.
- [ ] 통합 테스트로 승인 흐름을 검증한다.

### Task 5: Agent Worker - natural language entity chaining MVP

**Files:**
- Create: `backend/workers/agent_worker/tool_registry.py`
- Create: `backend/workers/agent_worker/entity_chaining_service.py`
- Create: `backend/workers/agent_worker/structured_outputs.py`
- Create: `backend/tests/unit/test_entity_chaining_service.py`
- Create: `backend/tests/integration/test_entity_chaining_flow.py`

- [ ] 자연어 입력에서 account/contact/opportunity/activity 후보를 추출하는 structured output 계층을 구현한다.
- [ ] 기존 엔티티 유사 매칭과 신규 생성 후보 생성을 분리한다.
- [ ] 승인 전 preview payload를 생성한다.
- [ ] 승인 후 main-api command 경로를 통해 저장되도록 연결한다.

### Task 6: Domain + API Agent - stage recommendation engine

**Files:**
- Create: `backend/app/services/stage_recommendation_service.py`
- Modify: `backend/app/services/opportunity_service.py`
- Modify: `backend/app/api/v1/opportunities.py`
- Create: `backend/tests/unit/test_stage_recommendation_service.py`
- Create: `backend/tests/integration/test_stage_recommendation_api.py`

- [ ] 활동 메모/요약을 받아 추천 단계와 사유를 계산하는 규칙 계층을 추가한다.
- [ ] LLM 추천 결과와 규칙 fallback을 함께 지원한다.
- [ ] 추천 수락 시 실제 단계 변경과 감사 로그 연결을 구현한다.
- [ ] 거절 및 재요청 흐름을 회귀 테스트한다.

### Task 7: Risk Worker - stale deal signal engine and Slack delivery

**Files:**
- Create: `backend/workers/risk_worker/signal_engine.py`
- Create: `backend/workers/risk_worker/slack_notifier.py`
- Create: `backend/workers/risk_worker/scheduler.py`
- Create: `backend/tests/unit/test_risk_signal_engine.py`
- Create: `backend/tests/integration/test_risk_signal_delivery.py`

- [ ] POC 14일, 견적 7일, 신규 21일 규칙을 계산한다.
- [ ] 신호별 메시지 템플릿과 우선순위를 정의한다.
- [ ] Slack DM 발송 전송 이력을 저장한다.
- [ ] 배치와 재실행 시 중복 알림 방지 규칙을 추가한다.

### Task 8: Integration Worker - Gmail Draft and Calendar sync

**Files:**
- Create: `backend/workers/integration_worker/gmail_draft_service.py`
- Create: `backend/workers/integration_worker/calendar_sync_service.py`
- Create: `backend/app/services/external_account_service.py`
- Create: `backend/tests/integration/test_gmail_draft_service.py`
- Create: `backend/tests/integration/test_calendar_sync_service.py`

- [ ] Gmail Draft 생성 경로를 구현한다.
- [ ] Google Calendar refresh token 저장 및 동기화 모델을 추가한다.
- [ ] 데일리 브리핑용 일정 요약 payload를 정의한다.
- [ ] 외부 연동 실패/재시도 정책을 명시한다.

### Task 9: Insight Service + Frontend Agent - Bridge Insights MVP

**Files:**
- Create: `backend/insights/bridge_service/graph_query_service.py`
- Create: `backend/app/api/v1/bridge_insights.py`
- Create: `frontend/src/features/insights/BridgeInsightsPanel.tsx`
- Create: `frontend/src/features/insights/RelationshipGraph.tsx`
- Modify: `frontend/src/features/Dashboard.tsx`
- Create: `backend/tests/integration/test_bridge_insights_api.py`
- Create: `frontend/src/features/insights/BridgeInsightsPanel.test.tsx`

- [ ] 그래프 노드/엣지 조회 API를 정의한다.
- [ ] 딜/고객사 맥락 기반 bridge 추천 패널을 추가한다.
- [ ] D3.js 그래프 컴포넌트를 도입하되 읽기 중심 MVP로 제한한다.
- [ ] 추천 근거와 연결 경로를 UI에서 표시한다.

### Task 10: Frontend Agent - AI action panel and approval UX

**Files:**
- Create: `frontend/src/features/agent/AgentActionComposer.tsx`
- Create: `frontend/src/features/agent/AgentSuggestionPanel.tsx`
- Modify: `frontend/src/api/client.ts`
- Modify: `frontend/src/api/types.ts`
- Modify: `frontend/src/App.tsx`
- Create: `frontend/src/features/agent/AgentActionComposer.test.tsx`

- [ ] 자연어 입력창, 추천 preview, 승인/거절 버튼을 추가한다.
- [ ] 현재 엔티티 화면 우측 보조 패널 방식으로 점진 도입한다.
- [ ] 승인 전/후 상태와 오류를 분리해 보여준다.
- [ ] 실제 저장 결과와 AI 제안 결과를 구분해 노출한다.

### Task 11: Security Agent - policy, audit, and tool authorization

**Files:**
- Modify: `backend/app/core/rbac.py`
- Modify: `backend/app/core/security.py`
- Modify: `backend/app/services/audit_service.py`
- Create: `backend/app/services/tool_authorization_service.py`
- Create: `backend/tests/unit/test_tool_authorization_service.py`

- [ ] AI 툴별 실행 권한 정책을 추가한다.
- [ ] 승인형 액션과 즉시 실행형 액션 권한을 분리한다.
- [ ] 외부 토큰 저장 정책과 접근 감사 로그를 정리한다.
- [ ] 관리자 정책 화면이 읽을 수 있는 정책 payload를 정의한다.

### Task 12: Test Agent - v2 regression and release gate

**Files:**
- Modify: `docs/qa/test-strategy.md`
- Modify: `docs/qa/release-checklist.md`
- Create: `backend/tests/integration/test_v2_end_to_end_flow.py`
- Create: `frontend/src/App.v2-regression.test.tsx`

- [ ] AI 제안 -> 승인 -> 저장 -> 알림 -> 외부 초안 생성 흐름의 최소 회귀 시나리오를 정의한다.
- [ ] mock adapter 기반 통합 테스트를 정리한다.
- [ ] release checklist에 worker 운영 체크 항목을 추가한다.

## 3. Delivery Sequence

1. Planner Agent 문서와 경계 정의
2. Backend Foundation Agent runtime split skeleton
3. Domain Agent 데이터 모델 확장
4. API Agent 승인/추천 API
5. Agent Worker 자연어 체이닝 MVP
6. Stage recommendation
7. Risk Worker
8. Integration Worker
9. Bridge Insights
10. Frontend Agent UI 통합
11. Security Agent 정책 보강
12. Test Agent 회귀 및 릴리스 게이트

## 4. Verification Plan

- `make lint`
- `make typecheck`
- `make test`
- `make verify`
- 추가적으로 worker 단위 smoke test와 mocked external integration test를 분리한다.

## 5. Assumptions

- [ASSUMPTION] v2.0은 단일 저장소를 유지한다.
- [ASSUMPTION] 외부 액션은 승인형 기본값을 유지한다.
- [ASSUMPTION] Slack, Gmail, Calendar는 사용자별 연결 정보와 관리자 정책이 모두 갖춰져야 활성화된다.
- [ASSUMPTION] 인맥 그래프의 원천 데이터는 초기에는 수동 업로드 또는 관리자 입력 기반으로 시작한다.

## 6. Rollback Scope

- worker 단위는 feature flag 또는 route 숨김으로 비활성화 가능해야 한다.
- agent action write path는 승인 API를 끄는 방식으로 우회 가능해야 한다.
- 외부 연동은 토큰을 보존하되 스케줄 실행만 중지할 수 있어야 한다.

## 7. Approval and Risk Flags

이번 계획은 아래 위험 범위를 포함하므로 단계별 승인 게이트를 유지한다.

- [x] Database schema change
- [x] Authentication / authorization
- [x] External API contract
- [x] CI/CD or deployment
- [ ] Payment / billing
- [ ] Production dependency
- [x] Large refactor
