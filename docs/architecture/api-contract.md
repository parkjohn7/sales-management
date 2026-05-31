# API Contract

## 1. API Principles

- Resource-oriented paths
- Explicit request validation
- Consistent error format
- Backward compatibility by default
- Base URL: `/api/v1`
- Auth: Bearer token for business APIs, integration API key for inbound lead APIs

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
| POST | /auth/dev-token | Issue development JWT |
| GET | /leads | List leads |
| POST | /leads | Create lead |
| GET | /leads/{leadId} | Get lead detail |
| PATCH | /leads/{leadId} | Update lead and recalculate score |
| POST | /leads/{leadId}/assign | Assign lead owner |
| POST | /leads/{leadId}/convert | Convert lead to Account, Contact, Opportunity |
| POST | /leads/{leadId}/recalculate-score | Recalculate lead score |
| GET | /accounts | List accounts |
| POST | /accounts | Create account |
| GET | /accounts/{accountId} | Get account detail |
| GET | /accounts/{accountId}/contacts | List account contacts |
| GET | /accounts/{accountId}/opportunities | List account opportunities |
| GET | /contacts | List contacts |
| POST | /contacts | Create contact |
| GET | /opportunities | List opportunities |
| POST | /opportunities | Create opportunity |
| PATCH | /opportunities/{opportunityId} | Update amount, owner, or expected close date |
| POST | /opportunities/{opportunityId}/stage | Change pipeline stage |
| POST | /opportunities/{opportunityId}/close-won | Close as won |
| POST | /opportunities/{opportunityId}/close-lost | Close as lost |
| GET | /activities | List activities |
| POST | /activities | Create follow-up activity |
| GET | /dashboard/overview | Dashboard KPI and pipeline summary |
| GET | /dashboard/funnel | Funnel summary |
| GET | /dashboard/forecast | Forecast summary |
| GET | /dashboard/channel-performance | Channel performance |
| GET | /dashboard/activity-performance | Activity performance |
| POST | /integrations/web/leads | Create lead from website |
| POST | /integrations/chatbot/leads | Create lead from chatbot |

## 4. Versioning

- Breaking changes require explicit approval.
- Public contract changes require integration tests.

## 5. Open Questions

- Which fields require masking in list APIs?
- Which dashboard targets should be stored as configurable admin settings?
