#!/usr/bin/env bash
set -euo pipefail

echo "[verify] start"

if command -v make >/dev/null 2>&1; then
  make lint
  make typecheck
  make test
else
  echo "make not found"
  exit 1
fi

echo "[verify] success"
