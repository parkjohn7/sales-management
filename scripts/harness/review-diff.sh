#!/usr/bin/env bash
set -euo pipefail

BASE_BRANCH=${1:-main}

echo "# Diff Review Input"
echo ""
echo "Base branch: ${BASE_BRANCH}"
echo ""
echo "## Changed files"
git diff --name-status "${BASE_BRANCH}...HEAD" || git diff --name-status

echo ""
echo "## Diff stat"
git diff --stat "${BASE_BRANCH}...HEAD" || git diff --stat

echo ""
echo "## Full diff"
git diff "${BASE_BRANCH}...HEAD" || git diff
