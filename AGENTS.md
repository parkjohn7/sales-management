# Project Agent Instructions

## Project summary

SalesMangemetService is a sales management system for tracking customers, opportunities, follow-up activities, and sales performance.
The initial product direction is a Korean-language internal business tool.
The product name in Korean is `영업관리시스템`; do not describe it with external CRM category acronyms in product-facing documentation.
The production tech stack is React + TypeScript + Tailwind CSS, FastAPI, PostgreSQL, Docker Compose, and development JWT RBAC.
Codex must preserve architecture, quality, tests, and maintainability.

## Repository layout

- `src/`: production source code
- `tests/`: automated tests
- `docs/`: architecture, specs, operations
- `.codex/`: Codex project config and reusable prompts
- `.harness/`: rules, templates, skills, and run records
- `scripts/harness/`: verification and automation scripts
- `.github/workflows/`: CI quality gates

## Agent workstream model

Feature work is split by agent-owned workstreams. Each agent must work on an independent
`codex/<agent>/<feature>` branch and must not revert or rewrite work from other agents.

- Planner Agent: product requirements, glossary, API/data-model docs, workstream map
- Backend Foundation Agent: FastAPI app, database session, migrations, common API responses
- Domain Agent: domain models, scoring, pipeline, forecast, lead conversion services
- API Agent: `/api/v1` routers, schemas, pagination, filtering, error mapping
- Frontend Agent: React/Tailwind UI, API client, screens, loading/empty/error states
- Security Agent: development JWT, RBAC, role scopes, audit-log behavior
- Integration Agent: website/chatbot lead ingestion endpoints
- Test Agent: unit/integration/frontend/e2e tests and verification reports
- Merge Agent: PR review, conflict resolution, `make verify`, merge sequencing

## Required development flow

For every code task:

1. Read the task spec under `docs/specs/` if present.
2. Read relevant harness rules under `.harness/rules/`.
3. Generate or update `.harness/runs/<task-id>/impact-map.md`.
4. Produce an execution plan before code changes.
5. Wait for `[APPROVED]` before implementing non-trivial changes.
6. Modify only files listed in the approved plan.
7. Add or update tests.
8. Run `make verify` before reporting completion.
9. Fill `.harness/runs/<task-id>/verification-report.md`.
10. Summarize changed files, test results, risks, and follow-ups.

## Commands

Use these commands unless the task says otherwise:

```bash
make setup
make lint
make typecheck
make test
make test-unit
make test-integration
make test-e2e
make verify
```

## Coding standards

Follow `.harness/rules/coding-standards.md`.

Mandatory rules:

- Prefer simple, explicit code.
- Use semantic names.
- Avoid premature abstraction.
- Do not create new global utilities without clear reuse.
- Do not introduce hidden side effects.
- Fail fast with explicit errors.
- Keep public APIs backward-compatible unless the spec says otherwise.

## Architecture boundaries

Follow `.harness/rules/architecture-rules.md`.

Mandatory rules:

- UI must not access database directly.
- Domain logic must not depend on framework-specific request objects.
- Infrastructure code must not leak into domain models.
- API contracts must be documented.
- Database schema changes require migration and rollback notes.

## Testing rules

Follow `.harness/rules/testing-rules.md`.

Mandatory rules:

- New business logic requires unit tests.
- API changes require integration tests.
- User-critical flows require e2e or regression tests.
- Bug fixes require regression tests that fail before the fix.
- Do not delete tests to make CI pass.

## Security rules

Follow `.harness/rules/security-rules.md`.

Mandatory rules:

- Never commit secrets.
- Never log tokens, passwords, personal data, or credentials.
- Validate external inputs.
- Use parameterized queries.
- Authorization checks must be explicit.

## PR expectations

Every PR must include:

- Task/spec link
- Summary of changes
- Test evidence
- Risk assessment
- Rollback notes if applicable

## Out of bounds

Codex must not do the following without explicit approval:

- Add production dependencies
- Modify authentication or authorization behavior
- Change database schema
- Change deployment configuration
- Rewrite large modules
- Delete files
- Modify CI/CD pipelines
- Change public API contracts
