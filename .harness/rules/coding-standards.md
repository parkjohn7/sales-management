# Coding Standards

## Core principles

1. YAGNI: build only what is required.
2. Simple First: choose clear implementation first.
3. DRY Carefully: extract patterns after the second duplication, not before.
4. Fail Fast: explicit errors are better than silent failures.
5. Delete Aggressively: less code means fewer bugs.
6. Semantic Naming: use names optimized for comprehension.

## Naming

- Variables must describe role.
- Functions must describe behavior.
- Booleans should start with `is`, `has`, `can`, or `should`.
- API endpoints should be resource-oriented.

## Function design

- One function, one responsibility.
- Avoid hidden I/O.
- Handle exceptional cases explicitly.
- Extract complex conditions into named functions.

## Dependency rules

- Do not add libraries without approval.
- Check existing utilities before creating new ones.
- Do not introduce duplicate libraries.

## Error handling

- Error messages should include cause and action hint.
- Logs must not include sensitive data.
- Failures must not be ignored.
