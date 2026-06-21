#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_REGION:?Set GCP_REGION}"
: "${GCP_ARTIFACT_REPOSITORY:?Set GCP_ARTIFACT_REPOSITORY}"

GAR_HOST="${GCP_REGION}-docker.pkg.dev"
KEEP_COUNT="${KEEP_COUNT:-5}"
ACTIVE_BACKEND_DIGEST="${ACTIVE_BACKEND_DIGEST:-}"
ACTIVE_FRONTEND_DIGEST="${ACTIVE_FRONTEND_DIGEST:-}"

prune_image() {
  local image_name="$1"
  local active_digest="$2"
  local image_path="${GAR_HOST}/${GCP_PROJECT_ID}/${GCP_ARTIFACT_REPOSITORY}/${image_name}"

  local digests=()
  while IFS= read -r digest; do
    if [ -n "${digest}" ]; then
      digests+=("${digest}")
    fi
  done < <(
    gcloud artifacts docker images list "${image_path}" \
      --include-tags \
      --sort-by='~updateTime' \
      --format='get(version)'
  )

  if [ "${#digests[@]}" -le "${KEEP_COUNT}" ]; then
    echo "Skip ${image_name}: ${#digests[@]} digests only"
    return
  fi

  local keep_digests=""
  local index=0
  for digest in "${digests[@]}"; do
    if [ "${index}" -lt "${KEEP_COUNT}" ]; then
      keep_digests="${keep_digests}
${digest}"
    fi
    index=$((index + 1))
  done

  if [ -n "${active_digest}" ]; then
    keep_digests="${keep_digests}
${active_digest}"
  fi

  echo "Pruning ${image_name} with keep count ${KEEP_COUNT}"
  for digest in "${digests[@]}"; do
    if printf '%s\n' "${keep_digests}" | grep -Fxq "${digest}"; then
      echo "Keep ${image_name}@${digest}"
      continue
    fi
    echo "Delete ${image_name}@${digest}"
    gcloud artifacts docker images delete "${image_path}@${digest}" --quiet || true
  done
}

prune_image "${BACKEND_IMAGE_NAME:-${GCP_BACKEND_SERVICE:-sales-management-backend}}" "${ACTIVE_BACKEND_DIGEST}"
prune_image "${FRONTEND_IMAGE_NAME:-${GCP_FRONTEND_SERVICE:-sales-management-frontend}}" "${ACTIVE_FRONTEND_DIGEST}"
