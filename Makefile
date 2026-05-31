.PHONY: setup lint typecheck test test-unit test-integration test-e2e verify harness-impact harness-review harness-log

TASK_ID ?= manual-$(shell date +%Y%m%d-%H%M%S)

setup:
	@echo "Setup project dependencies"
	@if [ -f package.json ]; then \
		if command -v pnpm >/dev/null 2>&1; then pnpm install; else npm install; fi; \
	fi
	@if [ -f pyproject.toml ]; then \
		if command -v uv >/dev/null 2>&1; then uv sync; \
		elif command -v poetry >/dev/null 2>&1; then poetry install; \
		else python -m pip install -e .; fi; \
	fi

lint:
	@echo "Run lint"
	@if [ -f package.json ]; then \
		if command -v pnpm >/dev/null 2>&1; then pnpm lint; else npm run lint; fi; \
	elif [ -f pyproject.toml ]; then \
		ruff check .; \
	else \
		echo "No lint target configured yet"; \
	fi

typecheck:
	@echo "Run typecheck"
	@if [ -f package.json ]; then \
		if command -v pnpm >/dev/null 2>&1; then pnpm typecheck; else npm run typecheck; fi; \
	elif [ -f pyproject.toml ]; then \
		mypy .; \
	else \
		echo "No typecheck target configured yet"; \
	fi

test:
	@echo "Run tests"
	@if [ -f package.json ]; then \
		if command -v pnpm >/dev/null 2>&1; then pnpm test; else npm test; fi; \
	elif [ -f pyproject.toml ]; then \
		pytest -q; \
	else \
		echo "No test target configured yet"; \
	fi

test-unit:
	@echo "Run unit tests"
	@if [ -d tests/unit ] && [ -f pyproject.toml ]; then pytest tests/unit -q; else echo "No unit test target configured yet"; fi

test-integration:
	@echo "Run integration tests"
	@if [ -d tests/integration ] && [ -f pyproject.toml ]; then pytest tests/integration -q; else echo "No integration test target configured yet"; fi

test-e2e:
	@echo "Run e2e tests"
	@if [ -d tests/e2e ] && [ -f pyproject.toml ]; then pytest tests/e2e -q; else echo "No e2e test target configured yet"; fi

verify: lint typecheck test
	@echo "Verification complete"

harness-impact:
	bash scripts/harness/generate-impact-map.sh $(TASK_ID)

harness-review:
	bash scripts/harness/review-diff.sh

harness-log:
	bash scripts/harness/collect-run-log.sh $(TASK_ID)
