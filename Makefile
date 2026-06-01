.PHONY: setup lint lint-backend lint-frontend typecheck typecheck-backend typecheck-frontend test test-unit test-integration test-frontend test-e2e verify dev-backend dev-frontend local-postgres-up local-postgres-down migrate-sqlite-to-postgres harness-impact harness-review harness-log

TASK_ID ?= manual-$(shell date +%Y%m%d-%H%M%S)

setup:
	@echo "Setup 영업관리시스템 development dependencies"
	@if [ -f backend/pyproject.toml ]; then \
		if command -v uv >/dev/null 2>&1; then cd backend && uv sync --extra dev; \
		else echo "uv is required for backend setup"; exit 1; fi; \
	fi
	@if [ -f frontend/package.json ]; then \
		if command -v pnpm >/dev/null 2>&1; then pnpm --dir frontend install; else npm --prefix frontend install; fi; \
	fi

lint: lint-backend lint-frontend
	@echo "Lint complete"

lint-backend:
	@echo "Run backend lint"
	@if [ -f backend/pyproject.toml ]; then \
		cd backend && uv run ruff check app tests; \
	else echo "No backend lint target configured"; \
	fi

lint-frontend:
	@echo "Run frontend lint"
	@if [ -f frontend/package.json ]; then \
		if command -v pnpm >/dev/null 2>&1; then pnpm --dir frontend lint; else npm --prefix frontend run lint; fi; \
	else echo "No frontend lint target configured"; \
	fi

typecheck: typecheck-backend typecheck-frontend
	@echo "Typecheck complete"

typecheck-backend:
	@echo "Run backend typecheck"
	@if [ -f backend/pyproject.toml ]; then \
		cd backend && uv run mypy app; \
	else echo "No backend typecheck target configured"; \
	fi

typecheck-frontend:
	@echo "Run frontend typecheck"
	@if [ -f frontend/package.json ]; then \
		if command -v pnpm >/dev/null 2>&1; then pnpm --dir frontend typecheck; else npm --prefix frontend run typecheck; fi; \
	else echo "No frontend typecheck target configured"; \
	fi

test: test-unit test-integration test-frontend
	@echo "Tests complete"

test-unit:
	@echo "Run unit tests"
	@if [ -d backend/tests/unit ]; then cd backend && uv run pytest tests/unit -q; else echo "No unit test target configured"; fi

test-integration:
	@echo "Run integration tests"
	@if [ -d backend/tests/integration ]; then cd backend && uv run pytest tests/integration -q; else echo "No integration test target configured"; fi

test-frontend:
	@echo "Run frontend tests"
	@if [ -f frontend/package.json ]; then \
		if command -v pnpm >/dev/null 2>&1; then pnpm --dir frontend test; else npm --prefix frontend run test; fi; \
	else echo "No frontend test target configured"; \
	fi

test-e2e:
	@echo "Run e2e tests"
	@echo "No e2e test target configured yet"

verify: lint typecheck test
	@echo "Verification complete"

dev-backend:
	cd backend && uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

dev-frontend:
	@if command -v pnpm >/dev/null 2>&1; then pnpm --dir frontend dev; else npm --prefix frontend run dev; fi

local-postgres-up:
	docker compose up -d postgres

local-postgres-down:
	docker compose stop postgres

migrate-sqlite-to-postgres:
	bash scripts/dev/migrate-sqlite-to-postgres.sh

harness-impact:
	bash scripts/harness/generate-impact-map.sh $(TASK_ID)

harness-review:
	bash scripts/harness/review-diff.sh

harness-log:
	bash scripts/harness/collect-run-log.sh $(TASK_ID)
