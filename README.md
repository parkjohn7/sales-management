# 영업관리시스템

React + FastAPI 기반의 영업관리시스템입니다.
리드, 고객사, 연락처, 영업기회, 활동, Forecast, Dashboard, 개발용 JWT RBAC를 작은 기능 단위로 확장합니다.

## Stack

- Frontend: React, TypeScript, Tailwind CSS, Vite
- Backend: FastAPI, SQLAlchemy, Alembic
- Database: PostgreSQL for Docker/local integration, SQLite fallback for quick local development
- Verification: pytest, ruff, mypy, Vitest

## Quick start

```bash
make setup
make local-postgres-up
make migrate-sqlite-to-postgres
make dev-backend
make dev-frontend
```

Backend API: `http://localhost:8000/api/v1/health`
Frontend: `http://localhost:5173`

## Docker Compose

```bash
docker compose up --build
```

## Verification

```bash
make lint
make typecheck
make test
make verify
```

## Agent Workflow

Each feature should be implemented by an agent-owned branch:

```text
codex/<agent>/<feature>
```

The Test Agent verifies each branch before the Merge Agent merges it into `develop`.
