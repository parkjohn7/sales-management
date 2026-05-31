# Fix CI Failure Skill

## When to use

Use this skill when CI or local verification fails.

## Procedure

1. Read failure log.
2. Identify whether failure existed before current change.
3. Classify failure:
   - lint
   - typecheck
   - unit test
   - integration test
   - e2e test
   - dependency
   - environment
4. Fix the smallest relevant issue.
5. Re-run the failed command.
6. Update verification report.

## Rules

- Do not bypass failing tests.
- Do not delete failing tests.
- Do not weaken assertions without approval.
- Do not make unrelated refactors.
