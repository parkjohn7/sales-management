# Architecture Rules

## Recommended dependency direction

```text
UI/API Layer
  -> Application Layer
    -> Domain Layer
      -> Infrastructure Interface
        -> Infrastructure Implementation
```

## Rules

- Domain layer must not import UI or framework-specific modules.
- Application layer orchestrates use cases.
- Infrastructure layer handles database, external APIs, queues, and files.
- Shared utilities must be framework-independent.
- Cross-layer shortcuts are prohibited.

## API contract

When API behavior changes:

- Update API schema or documentation.
- Add integration tests.
- Document backward compatibility impact.
- Add migration notes when needed.

## Data model

When schema changes:

- Add migration.
- Add rollback strategy.
- Update `docs/architecture/data-model.md`.
- Add test data or fixtures.
