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
