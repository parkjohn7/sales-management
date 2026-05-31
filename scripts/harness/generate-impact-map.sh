#!/usr/bin/env bash
set -euo pipefail

TASK_ID=${1:-${TASK_ID:-manual-$(date +%Y%m%d-%H%M%S)}}
RUN_DIR=".harness/runs/${TASK_ID}"
mkdir -p "$RUN_DIR"

OUTPUT="$RUN_DIR/impact-map.md"

{
  echo "# Impact Map: ${TASK_ID}"
  echo ""
  echo "Generated at: $(date -Iseconds)"
  echo ""
  echo "## Git status"
  echo '```text'
  git status --short || true
  echo '```'
  echo ""
  echo "## Recently changed files"
  echo '```text'
  if git rev-parse --verify HEAD >/dev/null 2>&1; then
    git diff --name-only HEAD || true
  else
    git status --short | awk '{print $2}' || true
  fi
  echo '```'
  echo ""
  echo "## Repository tree"
  echo '```text'
  find . \
    -path './.git' -prune -o \
    -path './node_modules' -prune -o \
    -path './.venv' -prune -o \
    -path './.env' -prune -o \
    -path './.env.*' -prune -o \
    -path './dist' -prune -o \
    -path './build' -prune -o \
    -maxdepth 3 -type f -print | sort
  echo '```'
  echo ""
  echo "## Candidate tests"
  echo '```text'
  find tests -type f 2>/dev/null | sort || true
  echo '```'
} > "$OUTPUT"

echo "Impact map generated: $OUTPUT"
