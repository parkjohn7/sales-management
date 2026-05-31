# Task Spec: Sales Management MVP Foundation

## 1. Background

The project is being initialized from the Codex + Harness starter.
The first implementation should establish a small but usable sales-management foundation instead of jumping directly into a large CRM.

## 2. Goal

Build the first approved MVP slice for managing customers, sales opportunities, and follow-up activities.
The implementation plan must be approved before production code is written.

## 3. Non-goals

- Do not implement unrelated features.
- Do not add production dependencies without approval.
- Do not implement billing, accounting, marketing automation, or complex CRM integrations in the first slice.

## 4. Acceptance Criteria

- [ ] Architecture docs are updated.
- [ ] First MVP workflow is defined before implementation.
- [ ] Tests are defined for any business logic introduced.
- [ ] Verification commands pass.

## 5. Verification Commands

```bash
make lint
make typecheck
make test
make verify
```
