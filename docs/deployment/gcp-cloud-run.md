# GCP Cloud Run 배포 가이드

이 프로젝트는 Cloud Run에 백엔드와 프론트를 각각 컨테이너 서비스로 배포합니다.

## 구성

- Backend: FastAPI 컨테이너, Cloud Run 서비스 `sales-management-backend`
- Frontend: Vite build + Nginx 컨테이너, Cloud Run 서비스 `sales-management-frontend`
- Images: Artifact Registry
- DB: Cloud SQL PostgreSQL
- Migration: 백엔드 컨테이너 시작 시 `alembic upgrade head` 실행

## 사전 준비

GCP에서 다음 리소스를 준비합니다.

- Artifact Registry Docker repository
- Cloud SQL PostgreSQL instance/database/user
- Cloud Run 배포 권한을 가진 서비스 계정
- GitHub Actions Workload Identity Federation

권장 리전은 한국 테스트 기준 `asia-northeast3`입니다.

## 배포 전 요청 정보

아래 값이 확정되면 바로 배포를 진행할 수 있습니다.

- GCP 프로젝트 ID
- 배포 리전(예: `asia-northeast3`)
- Cloud Run 서비스명(backend/frontend)
- Artifact Registry 저장소명
- Cloud SQL 인스턴스 연결 여부
- Cloud SQL 사용 시 DB 이름/사용자/비밀번호
- GitHub Actions OIDC(Workload Identity Provider) 설정 여부
- 배포 후 사용할 최종 도메인(있으면)
- 운영용 시크릿 값
  - `DEV_TOKEN_SECRET`
  - `INTEGRATION_API_KEY`

## Cloud SQL DATABASE_URL

Cloud Run에서 Cloud SQL 연결을 사용할 때는 백엔드 서비스에 Cloud SQL instance를 연결하고,
`DATABASE_URL`을 다음 형태로 설정합니다.

```text
postgresql+psycopg://DB_USER:DB_PASSWORD@/DB_NAME?host=/cloudsql/PROJECT_ID:REGION:INSTANCE_NAME
```

예:

```text
postgresql+psycopg://sales:REPLACE_ME@/sales_management?host=/cloudsql/my-project:asia-northeast3:sales-management-db
```

## GitHub Variables

Repository Settings > Secrets and variables > Actions > Variables:

```text
GCP_PROJECT_ID
GCP_REGION
GCP_ARTIFACT_REPOSITORY
GCP_BACKEND_SERVICE
GCP_FRONTEND_SERVICE
GCP_WORKLOAD_IDENTITY_PROVIDER
GCP_SERVICE_ACCOUNT
GCP_CLOUD_SQL_INSTANCE
```

`GCP_CLOUD_SQL_INSTANCE`는 선택값입니다. Cloud SQL을 붙일 때만 사용합니다.

## GitHub Secrets

Repository Settings > Secrets and variables > Actions > Secrets:

```text
DATABASE_URL
DEV_TOKEN_SECRET
INTEGRATION_API_KEY
```

외부 테스트라도 `DEV_TOKEN_SECRET`과 `INTEGRATION_API_KEY`는 로컬 기본값을 쓰지 마세요.

## 자동 배포

`.github/workflows/deploy-cloud-run.yml`이 다음 순서로 실행됩니다.

1. `make verify`
2. Backend Docker build/push
3. Backend Cloud Run deploy
4. Backend URL 조회
5. Frontend Docker build/push, `VITE_API_BASE_URL=${BACKEND_URL}/api/v1` 주입
6. Frontend Cloud Run deploy
7. Frontend URL 조회
8. Backend `CORS_ORIGINS`를 Frontend URL로 업데이트
9. `/api/v1/health`, `/healthz` smoke test

`main` 브랜치 push 또는 GitHub Actions 수동 실행으로 배포됩니다.

## 로컬 수동 배포

로컬에서 `gcloud` 인증이 끝난 상태라면 아래처럼 실행할 수 있습니다.

```bash
export GCP_PROJECT_ID="your-project"
export GCP_REGION="asia-northeast3"
export GCP_ARTIFACT_REPOSITORY="sales-management"
export GCP_BACKEND_SERVICE="sales-management-backend"
export GCP_FRONTEND_SERVICE="sales-management-frontend"
export GCP_CLOUD_SQL_INSTANCE="your-project:asia-northeast3:sales-management-db"
export DATABASE_URL="postgresql+psycopg://sales:REPLACE_ME@/sales_management?host=/cloudsql/your-project:asia-northeast3:sales-management-db"
export DEV_TOKEN_SECRET="replace-with-random-secret"
export INTEGRATION_API_KEY="replace-with-random-key"

scripts/gcp/deploy-cloud-run.sh
```

## 운영 체크

- Backend health: `https://BACKEND_URL/api/v1/health`
- Frontend health: `https://FRONTEND_URL/healthz`
- 브라우저 테스트: 리드 생성, 리드 전환, 영업기회 단계 변경, 리포트, 연동 리드 생성
- Cloud Run logs에서 `alembic upgrade head` 성공 여부 확인

## 주의

- 현재 인증은 개발용 JWT입니다. 외부 테스트는 가능하지만 운영 공개 전 SSO 또는 사용자 관리가 필요합니다.
- 백엔드 CORS는 `CORS_ORIGINS` 환경변수로 제어합니다.
- 프론트의 API URL은 build time에 `VITE_API_BASE_URL`로 고정됩니다. 백엔드 URL이 바뀌면 프론트를 다시 빌드해야 합니다.
