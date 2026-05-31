#!/usr/bin/env bash
set -euo pipefail

echo "Setting up development environment..."

if [ -f package.json ]; then
  if command -v pnpm >/dev/null 2>&1; then
    pnpm install
  else
    npm install
  fi
fi

if [ -f pyproject.toml ]; then
  if command -v uv >/dev/null 2>&1; then
    uv sync
  elif command -v poetry >/dev/null 2>&1; then
    poetry install
  else
    python -m pip install -e .
  fi
fi

echo "Setup complete."
