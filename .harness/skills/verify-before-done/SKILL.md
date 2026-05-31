# Verify Before Done Skill

## When to use

Use this skill after any code change before reporting completion.

## Procedure

1. Run lint.
2. Run typecheck.
3. Run tests.
4. Run project-specific verification.
5. If any check fails, summarize failure and fix minimally.
6. Re-run failed checks.
7. Create or update verification report.

## Required commands

```bash
make lint
make typecheck
make test
make verify
```

## Output

- Commands run
- Result of each command
- Changed files
- Remaining risks
- Final status

## Rule

Never claim done if verification was not run.
