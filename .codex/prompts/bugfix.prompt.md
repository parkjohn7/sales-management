# Bug Fix Prompt

You must reproduce before fixing.

## Bug

<describe bug>

## Evidence

- Error message:
- Logs:
- Failing test:
- User scenario:

## Required process

1. Identify the smallest reproducible case.
2. Add or update a failing regression test.
3. Confirm the test fails before the fix.
4. Implement the smallest fix.
5. Confirm the regression test passes.
6. Run full relevant verification.
7. Report root cause and changed files.

## Constraints

- Do not rewrite unrelated code.
- Do not delete tests.
- Do not weaken assertions.
- Do not hide errors.

## Done when

- Regression test fails before fix and passes after fix.
- Relevant test suite passes.
- Root cause is documented.
