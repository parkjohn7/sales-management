# 에이전트 작업 분할 지도

## 브랜치 규칙

모든 기능 작업은 `codex/<agent>/<feature>` 브랜치에서 진행한다.
각 에이전트는 자기 소유 영역만 수정하고, 다른 에이전트의 변경을 되돌리지 않는다.

## 에이전트 소유 영역

| Agent | 주요 책임 | 기본 소유 경로 |
|---|---|---|
| Planner Agent | 요구사항, 용어, 작업 분할 | `docs/**`, `.harness/**` |
| Backend Foundation Agent | FastAPI, DB, Alembic, 공통 응답 | `backend/app/core/**`, `backend/app/db/**`, `backend/alembic/**` |
| Domain Agent | 모델과 비즈니스 로직 | `backend/app/models/**`, `backend/app/services/**` |
| API Agent | API 라우터와 스키마 | `backend/app/api/**`, `backend/app/schemas/**` |
| Frontend Agent | React UI와 API 클라이언트 | `frontend/**` |
| Security Agent | JWT, RBAC, 감사 로그 | `backend/app/core/security.py`, `backend/app/core/rbac.py`, `backend/app/services/audit_service.py` |
| Integration Agent | 외부 리드 인입 | `backend/app/api/v1/integrations.py` |
| Test Agent | 테스트와 검증 리포트 | `backend/tests/**`, `frontend/src/**/*.test.tsx`, `docs/qa/**` |
| Merge Agent | 리뷰, 충돌 해결, 통합 검증 | 공유 파일, PR 머지 |

## 공유 파일 정책

`Makefile`, `docker-compose.yml`, `README.md`, `docs/architecture/api-contract.md`,
`docs/architecture/data-model.md`는 충돌 가능성이 높다.
공유 파일을 수정하는 에이전트는 작업 계획에 사유와 머지 순서를 명시해야 한다.

## 머지 순서

1. Planner Agent 문서 정리
2. Backend Foundation Agent
3. Domain Agent
4. API Agent
5. Security Agent
6. Integration Agent
7. Frontend Agent
8. Test Agent
9. Merge Agent 통합 검증
