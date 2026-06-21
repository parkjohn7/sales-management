# HISTORY

## 목적

이 문서는 영업관리시스템의 **실행 이력**을 관리합니다.  
`plan.md`에 기록된 작업이 실제 구현, 검증, 커밋, 배포까지 끝나면 이 문서에 남깁니다.

## 관리 기준

- 계획: [plan.md](/Users/thebestguy/Documents/SalesMangemetService/plan.md)
- 실행 이력: `history.md`
- 기록 단위:
  - 작업 목적
  - 변경 파일/영역
  - 검증 결과
  - 배포 여부
  - 관련 커밋

---

## 2026-06-21

### Artifact Registry retention 정책 적용 및 오래된 이미지 정리

- 목적:
  - Artifact Registry에 누적되는 Cloud Run 이미지 비용을 줄이기 위해 retention 정책을 적용
  - 배포 태그 전략을 `latest + prod`로 정리
  - 현재 운영 중인 digest를 보호한 상태에서 오래된 이미지 즉시 정리

- 주요 변경 파일:
  - [.github/workflows/deploy-cloud-run.yml](/Users/thebestguy/Documents/SalesMangemetService/.github/workflows/deploy-cloud-run.yml)
  - [scripts/gcp/deploy-cloud-run.sh](/Users/thebestguy/Documents/SalesMangemetService/scripts/gcp/deploy-cloud-run.sh)
  - [scripts/gcp/apply-artifact-cleanup-policy.sh](/Users/thebestguy/Documents/SalesMangemetService/scripts/gcp/apply-artifact-cleanup-policy.sh)
  - [scripts/gcp/prune-artifact-images.sh](/Users/thebestguy/Documents/SalesMangemetService/scripts/gcp/prune-artifact-images.sh)
  - [docs/deployment/gcp-cloud-run.md](/Users/thebestguy/Documents/SalesMangemetService/docs/deployment/gcp-cloud-run.md)
  - [.harness/runs/artifact-registry-retention/impact-map.md](/Users/thebestguy/Documents/SalesMangemetService/.harness/runs/artifact-registry-retention/impact-map.md)
  - [.harness/runs/artifact-registry-retention/execution-plan.md](/Users/thebestguy/Documents/SalesMangemetService/.harness/runs/artifact-registry-retention/execution-plan.md)
  - [.harness/runs/artifact-registry-retention/verification-report.md](/Users/thebestguy/Documents/SalesMangemetService/.harness/runs/artifact-registry-retention/verification-report.md)

- 변경 내용:
  - GitHub Actions 배포 시 SHA 태그 대신 `prod`, `latest` 태그를 사용하도록 수정
  - 수동 배포 스크립트도 같은 태그 전략으로 정리
  - Artifact Registry cleanup policy 적용 스크립트 추가
  - 오래된 digest 즉시 정리 스크립트 추가
  - 운영 문서에 retention 정책과 즉시 정리 절차 추가

- 운영 적용 대상:
  - GCP project: `cherrychat-prod-2026`
  - Artifact Registry repository: `cherrychat-repo`
  - Active backend digest: `sha256:bd8aec8b06cd19232b929107d2e553dad2b85a796d699ec568cddd4cd8d00e2c`
  - Active frontend digest: `sha256:7540e847d5ca1fba42b1fe5f8870a0c755e61222594a7abe58b216f1a20ba921`

- 검증:
  - `bash -n scripts/gcp/deploy-cloud-run.sh`
  - `bash -n scripts/gcp/apply-artifact-cleanup-policy.sh`
  - `bash -n scripts/gcp/prune-artifact-images.sh`
  - `python3 -c "import yaml, pathlib; yaml.safe_load(pathlib.Path('.github/workflows/deploy-cloud-run.yml').read_text())"`
  - `make verify`
  - `gcloud artifacts repositories describe ...`
  - `gcloud artifacts docker images list ...`

- 결과:
  - cleanup policy 적용 완료
    - keep tagged: `latest`, `prod`
    - keep recent versions: backend `5`, frontend `5`
    - delete untagged older than `7d`
  - 운영 active digest에 `prod` 태그 부여 완료
  - backend/frontend 오래된 digest 즉시 정리 완료
  - 정리 후 남은 digest
    - backend `5`
    - frontend `5`
  - Artifact Registry size field는 즉시 크게 감소하지 않았으며 추후 반영 지연 가능성이 있음

## 2026-06-10

### 영업관리시스템 v2.0 Proactive Action Layer 설계 및 구현 계획 문서화

- 목적:
  - 기존 영업관리시스템을 유지하면서 AI 기반 선제적 액션 레이어를 흡수하기 위한 v2.0 구조 정의
  - 저장소는 유지하고 실행 단위를 분리하는 방향으로 설계 기준과 구현 순서를 확정
  - 기능 요구사항과 기술 요구사항, worker 경계, 에이전트별 개발 단계를 문서로 정리

- 주요 변경 파일:
  - [docs/specs/v2-0001-sales-management-v2-proactive-action-layer.md](/Users/thebestguy/Documents/SalesMangemetService/docs/specs/v2-0001-sales-management-v2-proactive-action-layer.md)
  - [docs/development/2026-06-10-sales-management-v2-implementation-plan.md](/Users/thebestguy/Documents/SalesMangemetService/docs/development/2026-06-10-sales-management-v2-implementation-plan.md)
  - [plan.md](/Users/thebestguy/Documents/SalesMangemetService/plan.md)
  - [history.md](/Users/thebestguy/Documents/SalesMangemetService/history.md)
  - [.harness/runs/sales-management-v2-design/impact-map.md](/Users/thebestguy/Documents/SalesMangemetService/.harness/runs/sales-management-v2-design/impact-map.md)
  - [.harness/runs/sales-management-v2-design/verification-report.md](/Users/thebestguy/Documents/SalesMangemetService/.harness/runs/sales-management-v2-design/verification-report.md)

- 변경 내용:
  - v2.0 Proactive Action Layer의 배경, 목표, 비목표 정의
  - AI 액션 레이어, 위험 시그널 엔진, 외부 워크플로우, Bridge Insights 요구사항 분리
  - `main-api`, `agent-worker`, `risk-worker`, `integration-worker`, `bridge-service` 실행 단위 분리안 정의
  - 신규 데이터 모델 개념과 소스 구조 분리안 정리
  - 에이전트별 작업 순서와 구현 단계 계획 문서화

- 검증:
  - `make verify`

- 결과:
  - 문서 기준의 v2.0 구조와 구현 순서가 정리됨
  - 후속 구현 작업이 단계별로 분할 가능한 상태가 됨

## 2026-06-08

### 최초 로그인 비밀번호 변경 강제 팝업 완화 및 서버 계정 비밀번호 재설정

- 목적:
  - 현재 환경에서는 최초 로그인 시 강제 비밀번호 변경 팝업을 띄우지 않고 메뉴에서만 변경 가능하게 조정
  - 운영환경에서는 환경 플래그로 강제 변경을 다시 켤 수 있도록 유지
  - 서버의 `sales@cherrylab.com` 계정 비밀번호를 `sales1234`로 재설정

- 주요 변경 파일:
  - [frontend/src/App.tsx](/Users/thebestguy/Documents/SalesMangemetService/frontend/src/App.tsx)
  - [frontend/src/App.test.tsx](/Users/thebestguy/Documents/SalesMangemetService/frontend/src/App.test.tsx)

- 변경 내용:
  - `VITE_ENFORCE_INITIAL_PASSWORD_CHANGE`가 `true`일 때만 강제 비밀번호 변경 모달이 자동으로 뜨도록 변경
  - 기본 동작은 `false`로 두어 현재 로컬/서버에서는 메뉴 기반 비밀번호 변경만 사용
  - 서버 계정 `sales@cherrylab.com` 비밀번호를 `sales1234`로 갱신

- 검증:
  - `npm test -- --run src/App.test.tsx`
  - `npm run typecheck`
  - 서버 로그인 API로 `sales@cherrylab.com / sales1234` 인증 확인

---

## 2026-06-07

### 리포트 KPI 고도화 및 설명 문구 반영

- 목적:
  - `리포트 단계` 카드를 제거하고 실무 지표 6종으로 교체
  - 각 지표가 무엇을 의미하는지 화면에서 바로 이해할 수 있도록 설명 문구 추가
  - plan -> history 운영 체계를 문서로 정리

- 반영 지표:
  - 이번달 신규 리드
  - 리드 전환율
  - 평균 영업기회 금액
  - Won 비율
  - 지연 영업기회
  - 후속활동 필요 건수

- 집계 기준:
  - 이번달 신규 리드: 이번 달 생성된 리드 수
  - 리드 전환율: 전환된 리드 / 전체 리드
  - 평균 영업기회 금액: 전체 영업기회 평균 금액
  - Won 비율: Won / (Won + Lost)
  - 지연 영업기회: 마감일이 지났지만 아직 종료되지 않은 영업기회
  - 후속활동 필요 건수: 닫히지 않은 영업기회 중 최근 활동이 없거나 다음활동 정보가 비어 있는 건수

- 주요 변경 파일:
  - [backend/app/services/dashboard_service.py](/Users/thebestguy/Documents/SalesMangemetService/backend/app/services/dashboard_service.py)
  - [backend/app/api/v1/dashboard.py](/Users/thebestguy/Documents/SalesMangemetService/backend/app/api/v1/dashboard.py)
  - [frontend/src/features/Dashboard.tsx](/Users/thebestguy/Documents/SalesMangemetService/frontend/src/features/Dashboard.tsx)
  - [frontend/src/components/MetricCard.tsx](/Users/thebestguy/Documents/SalesMangemetService/frontend/src/components/MetricCard.tsx)
  - [frontend/src/api/client.ts](/Users/thebestguy/Documents/SalesMangemetService/frontend/src/api/client.ts)
  - [frontend/src/api/types.ts](/Users/thebestguy/Documents/SalesMangemetService/frontend/src/api/types.ts)
  - [frontend/src/App.test.tsx](/Users/thebestguy/Documents/SalesMangemetService/frontend/src/App.test.tsx)
  - [backend/tests/integration/test_api_flow.py](/Users/thebestguy/Documents/SalesMangemetService/backend/tests/integration/test_api_flow.py)
  - [docs/architecture/api-contract.md](/Users/thebestguy/Documents/SalesMangemetService/docs/architecture/api-contract.md)

- 검증:
  - `npm test -- --run src/App.test.tsx`
  - `npm run typecheck`
  - `make verify`

- 결과:
  - 프론트 테스트 통과
  - 백엔드 통합 테스트 통과
  - 전체 검증 통과

- 관련 커밋:
  - `b35bead` feat: expand report metrics and add project history docs

- 배포:
  - Backend revision: `sales-management-backend-00030-jxp`
  - Frontend revision: `sales-management-frontend-00014-gwj`
  - Backend health 확인 완료
  - Frontend root 응답 확인 완료

---

## 주요 누적 작업 이력

### 배포 및 인프라

- Cloud Run 배포 파이프라인 구성 및 안정화
- GitHub Actions 배포 워크플로우 정비
- Cloud Run 백엔드/프론트 재배포 및 smoke test 정착
- 로컬 PostgreSQL 기본 사용 전환 및 SQLite -> PostgreSQL 이관 정리

관련 커밋 예시:
- `18a080d` fix: align cloud run workflow with required actions vars and secrets
- `c5839c7` fix: bootstrap alembic version table for cloud run startup
- `0491075` fix: build cloud run images for linux amd64
- `a469ffa` chore: smoke test frontend root in cloud run workflow
- `29e7458` chore: trigger full deploy pipeline validation
- `6be97cf` Move local Postgres to 5433 and refine dashboard lists

### 브랜딩 및 UI

- CherrySales 브랜딩 통일
- CherryChat 톤 기반 좌측 메뉴/브랜드 쉘 정리
- 영업기회/리드 간 링크 구조 개선
- 영업기회 목록에 리드 컬럼 상시 표시

관련 커밋 예시:
- `25f2e05` feat: refresh CherrySales brand shell
- `2d82f79` style: align CherrySales sidebar with cherrychat tone
- `3cb7d0d` feat: link converted leads to opportunities
- `d7cb5d0` fix: always show opportunity lead column

### 영업 흐름 및 도메인

- 리드 -> 고객사/연락처/영업기회 전환 흐름 구현
- 영업기회 단계 변경 및 종료 사유 처리 안정화
- 단계별 체크리스트 자동 진행 구조 도입
- 활동 등록 시 체크리스트와 연동되는 흐름 구축

관련 커밋 예시:
- `1636031` Remove opportunity next step and fix close-reason persistence
- `b3f0ea8` Add opportunity stage checklist automation

### 인증 및 운영

- 로그인 사용자 정보를 백엔드 저장 구조로 일원화
- 최초 로그인 후 비밀번호 변경 강제 플로우 안정화
- 관리자/연동 운영정책 설명 UI 보강

관련 커밋 예시:
- `f081222` feat: document ops policy in UI and centralize login users in backend
- `6ac3791` fix: close forced password modal immediately after successful change
- `4d18fd2` fix: persist login user password state updates in admin settings json

### 데이터 및 시드

- 서버 DB용 데모 3건(리드/영업기회/활동) 시드 경로 정리
- 배포 후 서버 API 기준으로 데모 데이터 동기화 가능하게 스크립트화

관련 커밋 예시:
- `b60d73b` Default local DB to PostgreSQL and add SQLite migration script
- `4d1acd7` fix: stabilize sqlite to postgres migration for local postgres default
