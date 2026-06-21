#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_REGION:?Set GCP_REGION}"
: "${GCP_ARTIFACT_REPOSITORY:?Set GCP_ARTIFACT_REPOSITORY}"
: "${GCP_BACKEND_SERVICE:?Set GCP_BACKEND_SERVICE}"
: "${GCP_FRONTEND_SERVICE:?Set GCP_FRONTEND_SERVICE}"
: "${DATABASE_URL:?Set DATABASE_URL}"
: "${DEV_TOKEN_SECRET:?Set DEV_TOKEN_SECRET}"
: "${INTEGRATION_API_KEY:?Set INTEGRATION_API_KEY}"

IMAGE_TAG="${IMAGE_TAG:-$(git rev-parse --short HEAD)}"
GAR_HOST="${GCP_REGION}-docker.pkg.dev"
IMAGE_PREFIX="${GAR_HOST}/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REPOSITORY}"
BACKEND_IMAGE_REPO="${IMAGE_PREFIX}/${GCP_BACKEND_SERVICE}"
FRONTEND_IMAGE_REPO="${IMAGE_PREFIX}/${GCP_FRONTEND_SERVICE}"
BACKEND_IMAGE="${BACKEND_IMAGE_REPO}:prod"
FRONTEND_IMAGE="${FRONTEND_IMAGE_REPO}:prod"

gcloud config set project "${GCP_PROJECT_ID}" >/dev/null
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com sqladmin.googleapis.com

gcloud artifacts repositories describe "${GCP_ARTIFACT_REPOSITORY}" \
  --location "${GCP_REGION}" >/dev/null 2>&1 \
  || gcloud artifacts repositories create "${GCP_ARTIFACT_REPOSITORY}" \
    --repository-format docker \
    --location "${GCP_REGION}" \
    --description "영업관리시스템 containers"

gcloud auth configure-docker "${GAR_HOST}" --quiet

docker buildx build \
  --platform linux/amd64 \
  --label "org.opencontainers.image.revision=$(git rev-parse HEAD)" \
  -t "${BACKEND_IMAGE}" \
  -t "${BACKEND_IMAGE_REPO}:latest" \
  --push \
  ./backend

BACKEND_DEPLOY_ARGS=(
  run deploy "${GCP_BACKEND_SERVICE}"
  --image "${BACKEND_IMAGE}"
  --region "${GCP_REGION}"
  --platform managed
  --allow-unauthenticated
  --port 8000
  --set-env-vars "APP_ENV=prod"
  --set-env-vars "DATABASE_URL=${DATABASE_URL}"
  --set-env-vars "DEV_TOKEN_SECRET=${DEV_TOKEN_SECRET}"
  --set-env-vars "INTEGRATION_API_KEY=${INTEGRATION_API_KEY}"
  --set-env-vars "^~^CORS_ORIGINS=${CORS_ORIGINS:-http://localhost:5173,http://127.0.0.1:5173}"
)

if [ -n "${GCP_CLOUD_SQL_INSTANCE:-}" ]; then
  BACKEND_DEPLOY_ARGS+=(--add-cloudsql-instances "${GCP_CLOUD_SQL_INSTANCE}")
fi

gcloud "${BACKEND_DEPLOY_ARGS[@]}"

BACKEND_URL="$(gcloud run services describe "${GCP_BACKEND_SERVICE}" \
  --region "${GCP_REGION}" \
  --format 'value(status.url)')"

docker buildx build \
  --platform linux/amd64 \
  --build-arg "VITE_API_BASE_URL=${BACKEND_URL}/api/v1" \
  --label "org.opencontainers.image.revision=$(git rev-parse HEAD)" \
  -t "${FRONTEND_IMAGE}" \
  -t "${FRONTEND_IMAGE_REPO}:latest" \
  --push \
  ./frontend

gcloud run deploy "${GCP_FRONTEND_SERVICE}" \
  --image "${FRONTEND_IMAGE}" \
  --region "${GCP_REGION}" \
  --platform managed \
  --allow-unauthenticated \
  --port 8080

FRONTEND_URL="$(gcloud run services describe "${GCP_FRONTEND_SERVICE}" \
  --region "${GCP_REGION}" \
  --format 'value(status.url)')"

gcloud run services update "${GCP_BACKEND_SERVICE}" \
  --region "${GCP_REGION}" \
  --update-env-vars "^~^CORS_ORIGINS=${FRONTEND_URL},http://localhost:5173,http://127.0.0.1:5173"

echo "Backend:  ${BACKEND_URL}"
echo "Frontend: ${FRONTEND_URL}"
