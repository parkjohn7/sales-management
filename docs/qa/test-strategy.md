# Test Strategy

## 1. Required Test Layers

- Backend unit tests: lead score, lead grade, forecast, stage changes, validation rules.
- Backend integration tests: `/api/v1` endpoints, error format, authentication and RBAC.
- Frontend tests: Korean labels, dashboard rendering, API integration state.
- Migration checks: Alembic upgrade/downgrade for database schema changes.
- E2E smoke test: 리드 등록 -> 전환 -> 단계 변경 -> 활동 등록.

## 2. Agent Ownership

- Domain Agent writes unit tests for business services.
- API Agent writes integration tests for endpoint behavior.
- Frontend Agent writes component tests for UI changes.
- Security Agent writes permission and audit-log tests.
- Test Agent runs the full suite and records verification evidence.

## 3. Required Commands

```bash
make lint
make typecheck
make test-unit
make test-integration
make test-frontend
make verify
```
