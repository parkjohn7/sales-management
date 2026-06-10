# Impact Map: sales-management-v2-design

Generated at: 2026-06-10 16:10:00

## 1. Task Summary

영업관리시스템 v2.0 Proactive Action Layer의 설계 문서와 구현 계획 문서를 작성한다.
기존 v1 구조를 유지하면서 실행 단위를 분리하는 방향을 기준으로 기능 요구사항,
기술 요구사항, 소스 구조, 에이전트별 개발 순서를 정의한다.

## 2. Files to Modify

| File | Reason |
|---|---|
| `docs/specs/v2-0001-sales-management-v2-proactive-action-layer.md` | v2.0 설계 문서 신규 작성 |
| `docs/development/2026-06-10-sales-management-v2-implementation-plan.md` | 구현 계획 문서 신규 작성 |
| `plan.md` | v2.0 계획 항목 등록 |
| `history.md` | 설계/계획 문서 작성 이력 기록 |
| `.harness/runs/sales-management-v2-design/verification-report.md` | 검증 결과 기록 |

## 3. Files to Read

| File | Reason |
|---|---|
| `AGENTS.md` | 문서 작업 절차와 승인 규칙 확인 |
| `.harness/rules/architecture-rules.md` | 아키텍처 경계 준수 |
| `.harness/rules/testing-rules.md` | 문서화된 테스트 기대치 반영 |
| `docs/architecture/overview.md` | 기존 시스템 경계와 사용자 정의 확인 |
| `docs/architecture/workstream-map.md` | 에이전트 소유 영역 확인 |
| `docs/specs/0001-initial-feature.md` | 기존 spec 문서 톤 확인 |
| `plan.md` | plan -> history 관리 규칙 확인 |

## 4. Dependent Files

| File | Dependency |
|---|---|
| `docs/architecture/api-contract.md` | 이후 v2 API 정의 시 참조 필요 |
| `docs/architecture/data-model.md` | 이후 데이터 모델 델타 상세화 필요 |
| `docs/qa/test-strategy.md` | 구현 시 테스트 전략 확장 필요 |

## 5. Tests Affected

| Test | Reason |
|---|---|
| `make verify` | 문서 작업 후 기본 검증 수행 |

## 6. Parallel Work Conflicts

| Shared file or module | Potential conflict | Coordination plan |
|---|---|---|
| `plan.md` | 동시 작업 시 현재 계획 항목 충돌 가능 | v2 문서 작업 항목만 최소 범위로 추가 |
| `history.md` | 다른 완료 작업과 기록 충돌 가능 | 날짜/주제별 블록으로 분리 |

## 7. Architecture Boundaries

Do not modify:

- `backend/app/**`
- `frontend/src/**`
- 배포 설정과 인증 동작

## 8. Existing Patterns

Follow:

- 기능/기술 요구사항 분리
- 에이전트 책임과 머지 순서 명시
- plan -> history 운영 규칙 유지

## 9. Merge Sequencing

- Planner 문서 작업 단독 머지 가능

## 10. Risk Areas

- 아직 구현되지 않은 v2 구조를 문서에서 너무 구체적으로 고정하면 나중에 구현 유연성이 줄어들 수 있다.
- 외부 연동과 AI 쓰기 액션은 안전장치 정의가 빠지면 잘못된 기대를 만들 수 있다.
