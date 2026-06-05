# Verification Report: Opportunity Stage Checklist Automation

## Implemented

- 영업기회 스테이지별 체크리스트 상태 저장 필드 추가
- 활동 생성 시 현재 단계 체크리스트의 `activity_logged` 자동 체크
- 현재 단계 체크리스트 전체 완료 시 다음 단계 자동 전환
- 영업기회 화면 내 현재 단계 체크리스트 UI 추가
- 테스트용 리드 3건/고객사 전환/영업기회/활동 데모 시드 스크립트 추가
- 스테이지별 체크리스트 운영 문서 분리

## Regression Coverage

- backend integration:
  - 활동 등록 전 체크리스트 진행 차단
  - 활동 등록 후 체크리스트 활성화
  - 체크리스트 완료 시 자동 단계 승급
- frontend:
  - 선택한 영업기회의 체크리스트 로딩

## Verification Commands

```bash
cd backend && uv run pytest tests/integration/test_api_flow.py -q
cd frontend && npm test -- --run src/App.test.tsx
make verify
```

## Verification Results

- backend integration tests: `11 passed`
- frontend tests: `6 passed`
- `make verify`: passed
  - backend lint: passed
  - backend mypy: passed
  - backend unit tests: `5 passed`
  - backend integration tests: `11 passed`
  - frontend tests: `6 passed`

## Local Demo Data

- seed script: `scripts/dev/seed_stage_checklist_demo.py`
- runtime demo database: `backend/.local/stage_checklist_demo.db`
- seeded result:
  - 리드 3건 생성
  - 고객사/연락처/영업기회 전환
  - 활동 생성
  - QUALIFIED / PROPOSAL / NEGOTIATION 단계 예시 데이터 준비

## Runtime Notes

- 현재 로컬 기본 PostgreSQL(`localhost:5432`)은 포트 충돌 및 인증 불일치로 즉시 사용 불가
- 데모 확인용으로는 별도 SQLite 런타임 DB를 사용해 기능을 검증함
