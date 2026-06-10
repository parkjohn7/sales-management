# Impact Map: sales-management-v2-runtime-split

Generated at: 2026-06-10 16:35:00

## 1. Task Summary

영업관리시스템 v2.0 Phase A의 첫 구현 단계로 runtime split skeleton을 추가한다.
이번 단계에서는 메인 API를 유지하면서 worker/service 실행 단위용 폴더,
설정 값, docker-compose 골격, smoke test만 도입한다.

## 2. Files to Modify

| File | Reason |
|---|---|
| `backend/app/core/config.py` | service role 및 worker용 설정 추가 |
| `backend/Dockerfile` | worker/insight 모듈을 이미지에 포함 |
| `docker-compose.yml` | worker 서비스 골격 추가 |
| `plan.md` | 현재 작업 상태 반영 |
| `history.md` | 완료 후 실행 이력 기록 |
| `.harness/runs/sales-management-v2-runtime-split/verification-report.md` | 검증 결과 기록 |

## 3. Files to Read

| File | Reason |
|---|---|
| `AGENTS.md` | 작업 절차와 승인 경계 확인 |
| `docs/specs/v2-0001-sales-management-v2-proactive-action-layer.md` | v2.0 runtime split 기준 확인 |
| `docs/development/2026-06-10-sales-management-v2-implementation-plan.md` | Task 2 구현 범위 확인 |
| `.harness/rules/architecture-rules.md` | 계층 경계 준수 |
| `.harness/rules/testing-rules.md` | smoke/regression test 범위 확인 |
| `backend/app/core/config.py` | 기존 설정 구조 재사용 |
| `docker-compose.yml` | 현재 로컬 실행 구조 확인 |
| `backend/Dockerfile` | backend 이미지 포함 경로 확인 |

## 4. Dependent Files

| File | Dependency |
|---|---|
| `backend/workers/**` | 새 worker entrypoint와 runtime helper |
| `backend/insights/**` | bridge-service skeleton |
| `backend/tests/unit/test_runtime_split.py` | 새 설정 및 entrypoint smoke test |

## 5. Tests Affected

| Test | Reason |
|---|---|
| `backend/tests/unit/test_runtime_split.py` | worker role/config/entrypoint smoke test |
| `make verify` | 전체 회귀 검증 |

## 6. Parallel Work Conflicts

| Shared file or module | Potential conflict | Coordination plan |
|---|---|---|
| `docker-compose.yml` | 인프라/배포 계열 작업과 충돌 가능 | 이번 단계는 local skeleton 범위만 최소 수정 |
| `backend/app/core/config.py` | 다른 feature의 환경 변수 추가와 충돌 가능 | 새 필드는 worker 관련 접두어와 서비스 role 중심으로 추가 |

## 7. Architecture Boundaries

Do not modify:

- `backend/app/api/**`
- `backend/app/models/**`
- `frontend/src/**`
- 인증/권한 동작

## 8. Existing Patterns

Follow:

- `app.core.config.Settings` 중심 설정 관리
- backend와 frontend를 분리한 현재 compose 패턴 유지
- unit test는 observable behavior 위주 검증

## 9. Merge Sequencing

- Backend Foundation Agent skeleton을 먼저 머지
- 이후 Domain/API/Frontend 작업이 이어짐

## 10. Risk Areas

- docker-compose에 새 서비스가 들어가면 기존 로컬 실행 흐름이 깨질 수 있다.
- worker code를 추가하더라도 실제 비즈니스 로직이 아직 없으므로 실행이 long-running skeleton임을 명확히 해야 한다.
