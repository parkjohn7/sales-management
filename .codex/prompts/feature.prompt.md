# Feature Development Prompt

You must follow the repository AGENTS.md and harness rules.

## Goal

Implement the following feature:

<describe feature>

## Context

Relevant files:

- `path/to/file`

Relevant docs:

- `docs/specs/<spec>.md`
- `.harness/rules/coding-standards.md`
- `.harness/rules/testing-rules.md`

## Constraints

- Do not modify files outside the impact map without approval.
- Do not add dependencies without approval.
- Follow existing patterns.
- Add or update tests.
- Run verification before completion.

## Required process

1. Generate impact map.
2. Produce execution plan.
3. Stop and wait for approval if assumptions exist.
4. Implement only approved changes.
5. Add/update tests.
6. Run verification.
7. Produce verification report.

## Done when

- Acceptance criteria are met.
- Tests pass.
- Verification report is complete.
- Diff is reviewed against `.harness/templates/code-review-checklist.md`.
