# Impact Map: Opportunity Stage Checklist Automation

## Goal

영업기회에 스테이지별 체크리스트를 도입하고, 체크 완료 시 다음 스테이지로 자동 전환되도록 만든다.  
테스트용 리드 3건을 등록하고 고객사/영업기회 전환 및 활동 생성까지 포함하는 데모 데이터를 준비한다.

## Scope

### Backend

- 영업기회 체크리스트 상태 저장 필드 추가
- 체크리스트 조회/토글 API 추가
- 활동 생성 이후 체크리스트 자동 진행 허용
- 현재 스테이지 체크 완료 시 다음 스테이지 자동 승급

### Frontend

- 영업기회 상세/수정 영역에 현재 스테이지 체크리스트 노출
- 체크박스 클릭 시 API 호출
- 자동 단계 변경 결과/메시지 반영

### Data / Docs

- 테스트 데이터 시드 스크립트 추가
- 체크리스트 전체 목록 문서 추가
- 스테이지별 체크리스트 문서 파일 분리

## Files Expected In Scope

- `backend/app/models/entities.py`
- `backend/app/schemas/domain.py`
- `backend/app/api/v1/opportunities.py`
- `backend/app/api/v1/activities.py`
- `backend/app/services/opportunity_service.py`
- `backend/app/services/*checklist*.py` (new)
- `backend/alembic/versions/*` (new)
- `backend/tests/integration/test_api_flow.py`
- `frontend/src/api/types.ts`
- `frontend/src/api/client.ts`
- `frontend/src/features/Dashboard.tsx`
- `frontend/src/App.test.tsx`
- `scripts/dev/*seed*` (new)
- `docs/specs/opportunity-stage-checklists/*` (new)

## Risks

- 스테이지 자동 변경 로직이 기존 Won/Lost 수동 종료 로직과 충돌할 수 있다.
- 테스트 데이터 시드가 중복 생성될 수 있으므로 idempotent 처리 필요.
- 체크리스트 상태 저장을 위한 DB 마이그레이션이 필요하다.

## Verification

- backend integration tests for checklist progression
- frontend tests for checklist rendering interaction
- `make verify`
- demo seed script execution
