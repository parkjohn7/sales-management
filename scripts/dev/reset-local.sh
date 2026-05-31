#!/usr/bin/env bash
set -euo pipefail

echo "Reset local development artifacts."
rm -rf .codex-log .pytest_cache .mypy_cache .ruff_cache dist build
find . -name "__pycache__" -type d -prune -exec rm -rf {} +
echo "Reset complete."
