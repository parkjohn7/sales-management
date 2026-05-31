# Code Review Rules

## Review dimensions

1. Correctness
2. Scope control
3. Architecture consistency
4. Test coverage
5. Security
6. Maintainability
7. Performance risk
8. Documentation impact

## Mandatory review questions

- Does the change solve the stated problem?
- Are unrelated files modified?
- Are assumptions documented?
- Are tests sufficient?
- Could this break existing behavior?
- Is there any security or data exposure risk?
- Is rollback clear?

## Rejection criteria

Reject or request changes if:

- No verification evidence is provided.
- Tests are missing for new logic.
- Public API changes are undocumented.
- Security-sensitive code changed without review notes.
- The implementation violates architecture boundaries.
- Scope creep is present.
