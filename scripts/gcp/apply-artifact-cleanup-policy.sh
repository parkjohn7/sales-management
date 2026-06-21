#!/usr/bin/env bash
set -euo pipefail

: "${GCP_PROJECT_ID:?Set GCP_PROJECT_ID}"
: "${GCP_REGION:?Set GCP_REGION}"
: "${GCP_ARTIFACT_REPOSITORY:?Set GCP_ARTIFACT_REPOSITORY}"

BACKEND_IMAGE_NAME="${BACKEND_IMAGE_NAME:-${GCP_BACKEND_SERVICE:-sales-management-backend}}"
FRONTEND_IMAGE_NAME="${FRONTEND_IMAGE_NAME:-${GCP_FRONTEND_SERVICE:-sales-management-frontend}}"
KEEP_COUNT="${KEEP_COUNT:-5}"
UNTAGGED_DELETE_AFTER="${UNTAGGED_DELETE_AFTER:-7d}"

POLICY_FILE="$(mktemp)"
cat >"${POLICY_FILE}" <<EOF
[
  {
    "name": "keep-release-tags",
    "action": { "type": "Keep" },
    "condition": {
      "tagState": "TAGGED",
      "tagPrefixes": ["latest", "prod"]
    }
  },
  {
    "name": "keep-backend-recent",
    "action": { "type": "Keep" },
    "mostRecentVersions": {
      "packageNamePrefixes": ["${BACKEND_IMAGE_NAME}"],
      "keepCount": ${KEEP_COUNT}
    }
  },
  {
    "name": "keep-frontend-recent",
    "action": { "type": "Keep" },
    "mostRecentVersions": {
      "packageNamePrefixes": ["${FRONTEND_IMAGE_NAME}"],
      "keepCount": ${KEEP_COUNT}
    }
  },
  {
    "name": "delete-old-untagged",
    "action": { "type": "Delete" },
    "condition": {
      "tagState": "UNTAGGED",
      "olderThan": "${UNTAGGED_DELETE_AFTER}"
    }
  }
]
EOF

gcloud artifacts repositories set-cleanup-policies "${GCP_ARTIFACT_REPOSITORY}" \
  --project "${GCP_PROJECT_ID}" \
  --location "${GCP_REGION}" \
  --policy "${POLICY_FILE}"

rm -f "${POLICY_FILE}"
