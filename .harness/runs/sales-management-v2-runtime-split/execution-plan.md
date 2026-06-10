# Execution Plan: sales-management-v2-runtime-split

## 1. Files to Modify

- `backend/app/core/config.py`: service role 및 worker 설정 추가
- `backend/Dockerfile`: workers/insights 경로 이미지 포함
- `docker-compose.yml`: main-api 외 worker skeleton 서비스 추가
- `plan.md`: 2026-06-10 phase A 작업 항목 추가/상태 반영
- `history.md`: 완료 후 실행 이력 추가
- `.harness/runs/sales-management-v2-runtime-split/verification-report.md`: 검증 결과 기록

## 1.1 Files to Read Only

- `AGENTS.md`
- `docs/specs/v2-0001-sales-management-v2-proactive-action-layer.md`
- `docs/development/2026-06-10-sales-management-v2-implementation-plan.md`
- `.harness/rules/architecture-rules.md`
- `.harness/rules/testing-rules.md`

## 1.2 Shared File Coordination

- `docker-compose.yml`: local runtime skeleton만 추가하고 기존 포트/서비스는 유지
- `plan.md`, `history.md`: 새 phase A 블록으로 분리 기록

## 2. Implementation Steps

1. worker/service role을 표현하는 설정 필드를 `Settings`에 추가한다.
2. `backend/workers/*`, `backend/insights/*` skeleton과 runtime helper를 추가한다.
3. `shared/contracts`, `shared/events` 패키지 뼈대를 추가한다.
4. `backend/Dockerfile`과 `docker-compose.yml`에 skeleton 서비스를 반영한다.
5. worker runtime summary를 검증하는 unit test를 추가한다.
6. `make verify`를 실행하고 검증 결과를 기록한다.

## 3. Tests to Add or Update

- `backend/tests/unit/test_runtime_split.py`: service role validation, runtime summary, worker entrypoint smoke test

## 4. Verification Steps

```bash
make verify
```

## 5. Assumptions

- [ASSUMPTION] 이번 단계는 실제 queue, Slack, Gmail, Calendar 연동 없이 skeleton만 도입한다.
- [ASSUMPTION] worker는 long-running process 형태의 placeholder loop로 시작한다.

## 5.1 Rollback Scope

- 새 worker/insight/shared skeleton 파일과 compose/config 변경만 되돌리면 된다.

## 6. Approval Required

Approval is required before implementation if this task includes:

- [ ] Database schema change
- [ ] Authentication / authorization
- [ ] Payment / billing
- [ ] External API contract
- [x] CI/CD or deployment
- [ ] Production dependency
- [ ] Large refactor
