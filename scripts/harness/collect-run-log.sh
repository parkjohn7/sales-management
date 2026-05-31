#!/usr/bin/env bash
set -euo pipefail

TASK_ID=${1:-${TASK_ID:-manual-$(date +%Y%m%d-%H%M%S)}}
RUN_DIR=".harness/runs/${TASK_ID}"
mkdir -p "$RUN_DIR"

{
  echo "# Run Log: ${TASK_ID}"
  echo ""
  echo "Generated at: $(date -Iseconds)"
  echo ""
  echo "## Git status"
  echo '```text'
  git status --short || true
  echo '```'
  echo ""
  echo "## Last commit"
  echo '```text'
  git log -1 --oneline || true
  echo '```'
} > "$RUN_DIR/run-log.md"

echo "Run log generated: $RUN_DIR/run-log.md"
