# API Contract

## 1. API Principles

- Resource-oriented paths
- Explicit request validation
- Consistent error format
- Backward compatibility by default

## 2. Error Format

```json
{
  "code": "ERROR_CODE",
  "message": "Human-readable message",
  "details": {}
}
```

## 3. Endpoints

| Method | Path | Purpose |
|---|---|---|
| GET | /health | Health check |
| GET | /customers | List customers |
| POST | /customers | Create customer |
| GET | /customers/{customerId} | Get customer detail |
| GET | /opportunities | List opportunities |
| POST | /opportunities | Create opportunity |
| PATCH | /opportunities/{opportunityId} | Update opportunity stage, amount, owner, or expected close date |
| GET | /activities | List activities |
| POST | /activities | Create follow-up activity |

## 4. Versioning

- Breaking changes require explicit approval.
- Public contract changes require integration tests.

## 5. Open Questions

- Will the first implementation be API-backed or local-only?
- What authentication method should be used?
- Which list filters are required for the first dashboard?
