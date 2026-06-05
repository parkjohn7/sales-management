# Lead Opportunity Links And Deploy Impact Map

## Goal

- 리드 목록에서 이미 전환된 리드는 `영업기회 전환` 버튼 대신 실제 영업기회명 링크를 보여준다.
- 영업기회 목록에서 원본 리드명을 보여주고 리드 화면으로 이동할 수 있게 한다.
- 변경 사항을 검증한 뒤 Cloud Run에 재배포하고 로컬 데모 3건을 서버 DB에 반영한다.

## Files In Scope

- Modify: `backend/app/models/entities.py`
- Modify: `backend/app/schemas/domain.py`
- Modify: `backend/tests/integration/test_api_flow.py`
- Modify: `frontend/src/api/types.ts`
- Modify: `frontend/src/features/Dashboard.tsx`
- Modify: `frontend/src/App.test.tsx`
- Modify: `.harness/runs/lead-opportunity-links-deploy/verification-report.md`
- Create: `scripts/gcp/seed_cloud_run_demo.py`

## Runtime / Ops Scope

- Reuse deployment script: `scripts/gcp/deploy-cloud-run.sh`
- Reuse demo seed source: `backend/.local/stage_checklist_demo.db`
- Reuse SQLite to PostgreSQL migration helper shape as reference, but server DB sync will be verified against deployed backend/database

## Risks

- 화면 전환 상태를 부모 컴포넌트로 올리면서 기존 선택/수정 동선이 깨질 수 있다.
- Pydantic 응답 필드 추가 시 기존 API 목록 응답 형식이 바뀌므로 통합 테스트가 필요하다.
- 배포 후 서버 DB 반영은 운영 DB 연결 정보와 현재 Cloud Run 환경 변수 일치 여부를 확인해야 한다.

## Execution Plan

1. 백엔드 응답에 영업기회의 원본 리드명 필드를 추가한다.
2. 대시보드 상위에서 리드/영업기회 선택 상태와 화면 이동 콜백을 관리한다.
3. 리드 목록과 영업기회 목록에 상호 링크를 추가하고 기존 전환 버튼은 미전환 리드에만 남긴다.
4. 프론트/백엔드 회귀 테스트를 추가하고 `make verify`로 검증한다.
5. Cloud Run에 재배포하고 서버 DB에 데모 3건이 들어갔는지 확인한다.
