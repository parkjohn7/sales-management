# Data Model

## 1. Core Entities

| Entity | Purpose |
|---|---|
| User | System account for sales staff and managers. |
| Account | Customer company or sales target organization. |
| Contact | Person linked to an Account. |
| Lead | Incoming sales lead before conversion. |
| Opportunity | Potential sale tracked through pipeline stages. |
| Activity | Follow-up task, call, meeting, email, or note. |
| StageHistory | Opportunity stage change history. |
| AuditLog | Immutable record of sensitive business actions. |

## 2. Relationships

```text
User 1 --- N Opportunity
Account 1 --- N Contact
Account 1 --- N Opportunity
Lead 1 --- 0..1 Opportunity
Opportunity 1 --- N Activity
Opportunity 1 --- N StageHistory
```

## 3. Constraints

- Account names should not be empty.
- Opportunity amount must be zero or greater.
- Opportunity stage must be one of LEAD, QUALIFIED, PROPOSAL, NEGOTIATION, CLOSED_WON, CLOSED_LOST.
- Activities keep owner and related customer or opportunity, and support optional next-activity plan fields (next activity/type/due date/priority).
- Closed Lost stage changes require a lost reason.
- Forecast amount is recalculated whenever amount or stage changes.

## 4. Migration Rules

- Every schema change requires a migration.
- Every migration requires rollback notes.
- Data compatibility must be documented.

## 5. Open Questions

- Should contacts be required for every Account?
- Should opportunity amounts support multiple currencies?
- Should duplicate Lead detection block creation or only warn?
