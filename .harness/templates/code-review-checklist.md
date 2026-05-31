# Code Review Checklist

## Correctness

- [ ] The implementation matches the task spec.
- [ ] Edge cases are handled.
- [ ] No unrelated behavior changed.

## Scope

- [ ] Only planned files were modified.
- [ ] No unnecessary abstractions were added.
- [ ] No unrelated cleanup was mixed in.

## Tests

- [ ] Relevant tests were added or updated.
- [ ] Regression tests exist for bug fixes.
- [ ] All required checks passed.

## Architecture

- [ ] Layer boundaries are respected.
- [ ] Existing patterns are followed.
- [ ] Public contracts are documented.

## Security

- [ ] No secrets are committed.
- [ ] Inputs are validated.
- [ ] Authorization is explicit.
- [ ] Sensitive data is not logged.

## Maintainability

- [ ] Names are clear.
- [ ] Code is simple.
- [ ] Dead code is removed.
- [ ] Documentation is updated if needed.
