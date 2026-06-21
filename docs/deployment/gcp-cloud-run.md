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

현재 저장소는 `sales-management-498110` 프로젝트에 대한 기본 배포 대상이 워크플로우에 내장되어 있습니다.
즉, 같은 GCP 프로젝트와 Cloud Run 서비스에 배포하는 경우 아래 Variables가 비어 있어도 워크플로우는 실행됩니다.

다만 다른 프로젝트나 서비스명으로 바꾸려면 아래 값을 GitHub Variables로 설정해 override하는 방식을 권장합니다.

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

기본 내장값은 아래와 같습니다.

```text
GCP_PROJECT_ID=sales-management-498110
GCP_REGION=asia-northeast3
GCP_ARTIFACT_REPOSITORY=sales-management-docker-repo
GCP_BACKEND_SERVICE=sales-management-backend
GCP_FRONTEND_SERVICE=sales-management-frontend
GCP_CLOUD_SQL_INSTANCE=sales-management-498110:asia-northeast3:free-trial-first-project
GCP_WORKLOAD_IDENTITY_PROVIDER=projects/57171998407/locations/global/workloadIdentityPools/github-actions-pool/providers/github-actions-provider
GCP_SERVICE_ACCOUNT=github-actions-deployer@sales-management-498110.iam.gserviceaccount.com
```

따라서 현재 저장소에서 필수로 유지되어야 하는 GitHub Actions 설정은 사실상 `Secrets` 3개입니다.

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
9. Backend `/api/v1/health`, Frontend `/` smoke test

`main` 브랜치 push 또는 GitHub Actions 수동 실행으로 배포됩니다.

## 이미지 보존 정책

운영 기본 전략은 아래를 권장합니다.

- 유지 태그: `latest`, `prod`
- 유지 개수: package별 최근 `5`개 digest
- 정리 대상: `UNTAGGED` 상태이면서 `7일`이 지난 digest

현재 저장소에서는 GitHub Actions가 배포 전에 cleanup policy를 다시 적용하므로,
저장소 정책 drift가 생겨도 다음 배포 때 복원됩니다.

정책 적용 스크립트:

```bash
export GCP_PROJECT_ID="your-project"
export GCP_REGION="asia-northeast3"
export GCP_ARTIFACT_REPOSITORY="your-repo"
export GCP_BACKEND_SERVICE="sales-management-backend"
export GCP_FRONTEND_SERVICE="sales-management-frontend"
export KEEP_COUNT="5"

bash scripts/gcp/apply-artifact-cleanup-policy.sh
```

즉시 오래된 이미지를 정리할 때는 현재 Cloud Run이 사용 중인 digest를 보존한 뒤
최근 5개를 제외한 오래된 digest를 삭제합니다.

```bash
export GCP_PROJECT_ID="your-project"
export GCP_REGION="asia-northeast3"
export GCP_ARTIFACT_REPOSITORY="your-repo"
export GCP_BACKEND_SERVICE="sales-management-backend"
export GCP_FRONTEND_SERVICE="sales-management-frontend"
export ACTIVE_BACKEND_DIGEST="sha256:..."
export ACTIVE_FRONTEND_DIGEST="sha256:..."
export KEEP_COUNT="5"

bash scripts/gcp/prune-artifact-images.sh
```

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
- Frontend root: `https://FRONTEND_URL/`
- 브라우저 테스트: 리드 생성, 리드 전환, 영업기회 단계 변경, 리포트, 연동 리드 생성
- Cloud Run logs에서 `alembic upgrade head` 성공 여부 확인

## 이번 GitHub Actions 실패 원인

2026-06-02 기준 원격 실패 run은 애플리케이션 코드 문제가 아니라, GitHub Actions `Variables`가 비어 있어서 `Validate deployment configuration` 단계에서 중단된 케이스였습니다.

실패 증상:

```text
Missing required Actions setting: GCP_PROJECT_ID
Missing required Actions setting: GCP_REGION
Missing required Actions setting: REPO
Missing required Actions setting: BACKEND_SERVICE
Missing required Actions setting: FRONTEND_SERVICE
Missing required Actions setting: WORKLOAD_IDENTITY_PROVIDER
Missing required Actions setting: GCP_SERVICE_ACCOUNT
```

이후 워크플로우를 수정해:

- 현재 운영 중인 GCP 대상은 기본값으로 내장
- 저장소 Variables가 있으면 그 값으로 override
- Secrets(`DATABASE_URL`, `DEV_TOKEN_SECRET`, `INTEGRATION_API_KEY`)만 필수 검증

구조로 정리했습니다.

## 주의

- 현재 인증은 개발용 JWT입니다. 외부 테스트는 가능하지만 운영 공개 전 SSO 또는 사용자 관리가 필요합니다.
- 백엔드 CORS는 `CORS_ORIGINS` 환경변수로 제어합니다.
- 프론트의 API URL은 build time에 `VITE_API_BASE_URL`로 고정됩니다. 백엔드 URL이 바뀌면 프론트를 다시 빌드해야 합니다.
