# Execution Plan: sales-management-v2-design

## 1. Files to Modify

- `docs/specs/v2-0001-sales-management-v2-proactive-action-layer.md`: v2.0 설계 문서 신규 작성
- `docs/development/2026-06-10-sales-management-v2-implementation-plan.md`: 실행 가능한 구현 계획 작성
- `plan.md`: 현재 계획 항목 등록
- `history.md`: 문서화 이력 기록
- `.harness/runs/sales-management-v2-design/verification-report.md`: 검증 결과 기록

## 1.1 Files to Read Only

- `AGENTS.md`: 문서 작업 규칙과 승인/검증 요구사항 확인
- `.harness/rules/architecture-rules.md`: 아키텍처 경계 확인
- `.harness/rules/testing-rules.md`: 테스트 기대치 확인
- `docs/architecture/overview.md`: 기존 구조와 사용자 범위 이해
- `docs/architecture/workstream-map.md`: 에이전트 소유 영역 기준 확인
- `docs/specs/0001-initial-feature.md`: 기존 스펙 문서 톤 확인

## 1.2 Shared File Coordination

- `plan.md`: v2 작업 항목만 최소 범위로 추가
- `history.md`: 2026-06-10 블록으로 분리 기록

## 2. Implementation Steps

1. v1 구조와 새 요구사항을 비교해 v2.0 확장 범위를 정의한다.
2. 기능 요구사항과 기술 요구사항을 분리해 설계 문서를 작성한다.
3. 실행 단위 분리와 소스 구조 분리안을 문서화한다.
4. 에이전트별 구현 단계와 머지 순서를 구현 계획으로 정리한다.
5. plan -> history 체계에 이번 설계 작업을 반영한다.
6. `make verify`를 실행하고 검증 결과를 리포트에 기록한다.

## 3. Tests to Add or Update

- 문서 작업이므로 신규 테스트는 추가하지 않는다.
- `make verify`로 기존 저장소 기본 검증을 유지한다.

## 4. Verification Steps

```bash
make verify
```

## 5. Assumptions

- [ASSUMPTION] 이번 턴은 설계와 계획 문서 작성까지가 범위이며, 실제 v2.0 코드 구현은 후속 작업으로 분리한다.
- [ASSUMPTION] 저장소는 유지하되 실행 단위를 나누는 방향이 승인되었다.

## 5.1 Rollback Scope

- 신규 문서와 계획 항목만 되돌리면 된다.

## 6. Approval Required

Approval is required before implementation if this task includes:

- [ ] Database schema change
- [ ] Authentication / authorization
- [ ] Payment / billing
- [ ] External API contract
- [ ] CI/CD or deployment
- [ ] Production dependency
- [ ] Large refactor
