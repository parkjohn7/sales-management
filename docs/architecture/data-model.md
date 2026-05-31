# Data Model

## 1. Core Entities

| Entity | Purpose |
|---|---|
| User | System account for sales staff and managers. |
| Customer | Company or individual being sold to. |
| Contact | Person linked to a customer. |
| Opportunity | Potential sale tracked through pipeline stages. |
| Activity | Follow-up task, call, meeting, email, or note. |
| PipelineStage | Configurable sales stage such as lead, proposal, negotiation, won, lost. |

## 2. Relationships

```text
User 1 --- N Opportunity
Customer 1 --- N Contact
Customer 1 --- N Opportunity
Opportunity 1 --- N Activity
PipelineStage 1 --- N Opportunity
```

## 3. Constraints

- Customer names should not be empty.
- Opportunity amount must be zero or greater.
- Opportunity stage must be one of the configured pipeline stages.
- Activities should keep due date, owner, status, and related customer or opportunity.

## 4. Migration Rules

- Every schema change requires a migration.
- Every migration requires rollback notes.
- Data compatibility must be documented.

## 5. Open Questions

- Should contacts be required for every customer?
- Should opportunity amounts support multiple currencies?
- What pipeline stages should be default for the first MVP?
