# Testing Rules

## Test hierarchy

1. Unit tests: pure business logic
2. Integration tests: API, database, external boundary
3. E2E tests: critical user journey
4. Regression tests: reproduced bug scenarios

## Required test mapping

| Change type | Required test |
|---|---|
| Business logic | Unit test |
| API endpoint | Integration test |
| DB query | Integration test |
| UI flow | E2E test |
| Bug fix | Regression test |
| Refactor | Existing tests must pass |

## Rules

- A bug fix without a regression test is incomplete.
- Do not weaken assertions to pass tests.
- Do not skip tests unless explicitly approved.
- Test names must describe behavior.
- Tests should verify observable behavior, not implementation details.
